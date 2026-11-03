package com.puff.tech.setting.usecase;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.puff.tech.core.usecases.MonoUC;
import com.puff.tech.core.utils.JsonUtils;
import com.puff.tech.onboarding.repository.MemberEntity;
import com.puff.tech.security.UseCaseContext;
import com.puff.tech.setting.DashboardSettingRowConfig;
import com.puff.tech.setting.DashboardSettingsConverter;
import com.puff.tech.setting.repository.DashboardSettingsAuditEntity;
import com.puff.tech.setting.repository.DashboardSettingsAuditRepository;
import com.puff.tech.setting.repository.DashboardSettingsEntity;
import com.puff.tech.setting.repository.DashboardSettingsRepository;
import com.puff.tech.setting.usecase.request.DashboardSettingUCDto;
import com.puff.tech.setting.usecase.request.UpdateDashboardSettingUCRequest;
import com.puff.tech.usermanagement.repository.UserRoleEntity;
import com.puff.tech.usermanagement.repository.UserRoleRepository;
import io.micronaut.http.HttpStatus;
import io.micronaut.http.exceptions.HttpStatusException;
import io.r2dbc.postgresql.codec.Json;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.util.List;

@Singleton
public class UpdateDashboardSettingsUseCase implements MonoUC<UpdateDashboardSettingUCRequest, DashboardSettingUCDto> {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    private final DashboardSettingsRepository dashboardSettingsRepository;
    private final DashboardSettingsAuditRepository auditRepository;
    private final UserRoleRepository userRoleRepository;
    private final GetConfigurableRolesUseCase configurableRolesUseCase;

    @Inject
    public UpdateDashboardSettingsUseCase(DashboardSettingsRepository dashboardSettingsRepository,
                                         DashboardSettingsAuditRepository auditRepository,
                                         UserRoleRepository userRoleRepository,
                                         GetConfigurableRolesUseCase configurableRolesUseCase) {
        this.dashboardSettingsRepository = dashboardSettingsRepository;
        this.auditRepository = auditRepository;
        this.userRoleRepository = userRoleRepository;
        this.configurableRolesUseCase = configurableRolesUseCase;
    }

    @Override
    public Mono<DashboardSettingUCDto> execute(UpdateDashboardSettingUCRequest request, UseCaseContext context) {
        Long memberId = context != null && context.securityContext() != null ? context.securityContext().memberId() : null;
        String username = context != null && context.securityContext() != null && context.securityContext().subject() != null
                ? context.securityContext().subject() : "system";

        List<String> callerRoles = context != null && context.securityContext() != null && context.securityContext().roles() != null
                ? context.securityContext().roles() : List.of();
        String primaryCallerRole = !callerRoles.isEmpty() ? callerRoles.getFirst() : "ADMIN";

        String targetRoleName = request.roleName() != null && !request.roleName().isBlank()
                ? request.roleName().trim()
                : "ADMIN";

        return configurableRolesUseCase.resolveCallerRoleOrder(primaryCallerRole)
                .flatMap(callerRoleOrder -> resolveTargetRoleOrder(targetRoleName, request.roleOrder())
                        .flatMap(targetRoleOrder -> {
                            // Validate role hierarchy rules
                            // Super admin can set dashboard setting of Super Admin and Admin (Order 1 and 2)
                            // Admin Can set dashboard setting of Less than Admin (Order 3)
                            if (callerRoleOrder == 1) {
                                if (targetRoleOrder != 1 && targetRoleOrder != 2) {
                                    return Mono.error(new HttpStatusException(HttpStatus.FORBIDDEN,
                                            "Super Admin can only configure Dashboard Settings for Order 1 and Order 2 roles. Target role is Order " + targetRoleOrder));
                                }
                            } else if (callerRoleOrder == 2) {
                                if (targetRoleOrder != 3) {
                                    return Mono.error(new HttpStatusException(HttpStatus.FORBIDDEN,
                                            "Admin can only configure Dashboard Settings for Order 3 roles (Less than Admin). Target role is Order " + targetRoleOrder));
                                }
                            } else {
                                return Mono.error(new HttpStatusException(HttpStatus.FORBIDDEN,
                                        "Users with role order " + callerRoleOrder + " cannot configure dashboard settings."));
                            }

                            Mono<DashboardSettingsEntity> findExisting = (request.id() != null && request.id() > 0)
                                    ? dashboardSettingsRepository.findById(request.id())
                                    : Mono.empty();

                            return findExisting
                                    .switchIfEmpty(dashboardSettingsRepository.findEffectiveSetting(memberId, targetRoleName, targetRoleOrder))
                                    .switchIfEmpty(Mono.defer(() -> {
                                        DashboardSettingsEntity newEntity = new DashboardSettingsEntity();
                                        if (memberId != null) {
                                            MemberEntity member = new MemberEntity();
                                            member.setId(memberId);
                                            newEntity.setMember(member);
                                        }
                                        newEntity.setRoleName(targetRoleName);
                                        newEntity.setRoleOrder(targetRoleOrder);
                                        return Mono.just(newEntity);
                                    }))
                                    .flatMap(entity -> {
                                        String prevJson = toJson(entity);

                                        // Pass roleId from SelectedRoles in first time insert/update. Otherwise set Old roleId
                                        if (request.roleId() != null && request.roleId() > 0) {
                                            entity.setRoleId(request.roleId());
                                        }

                                        entity.setRoleName(targetRoleName);
                                        entity.setRoleOrder(targetRoleOrder);

                                        String resolvedDashboardType;
                                        if (targetRoleOrder != null && targetRoleOrder == 1) {
                                            resolvedDashboardType = "Super Admin";
                                        } else if (targetRoleOrder != null && targetRoleOrder == 2) {
                                            resolvedDashboardType = "Admin";
                                        } else if (request.dashboardType() != null && !request.dashboardType().isBlank()
                                                && !request.dashboardType().equalsIgnoreCase("admin")
                                                && !request.dashboardType().equalsIgnoreCase("super admin")) {
                                            resolvedDashboardType = request.dashboardType().trim();
                                        } else {
                                            resolvedDashboardType = targetRoleName != null ? targetRoleName : "Custom";
                                        }
                                        entity.setDashboardType(resolvedDashboardType);
                                        if (request.enabled() != null) entity.setEnabled(request.enabled());

                                        if (request.rowsConfig() != null) entity.setRowsConfig(request.rowsConfig());

                                        entity.setShowSupplierChart(Boolean.TRUE.equals(request.showSupplierChart()));
                                        entity.setShowCustomerChart(Boolean.TRUE.equals(request.showCustomerChart()));
                                        entity.setShowInventoryChart(Boolean.TRUE.equals(request.showInventoryChart()));
                                        entity.setShowSystemMonitor(Boolean.TRUE.equals(request.showSystemMonitor()));

                                        entity.setUpdatedBy(username);
                                        entity.setUpdatedAt(Instant.now());

                                        Mono<DashboardSettingsEntity> resolveRoleIdMono = (entity.getRoleId() == null || entity.getRoleId() == 0)
                                                ? userRoleRepository.findByName(targetRoleName)
                                                        .map(role -> {
                                                            entity.setRoleId(role.getId());
                                                            return entity;
                                                        })
                                                        .defaultIfEmpty(entity)
                                                : Mono.just(entity);

                                        return resolveRoleIdMono.flatMap(entityToSave -> {
                                            Mono<DashboardSettingsEntity> saveMono = entityToSave.getId() != null
                                                    ? dashboardSettingsRepository.update(entityToSave)
                                                    : dashboardSettingsRepository.save(entityToSave);

                                            return saveMono.flatMap(saved -> {
                                                DashboardSettingsAuditEntity audit = new DashboardSettingsAuditEntity();
                                                audit.setDashboardSettingsId(saved.getId());
                                                if (saved.getMember() != null) {
                                                    audit.setMember(saved.getMember());
                                                }
                                                audit.setRoleName(saved.getRoleName());
                                                audit.setRoleOrder(saved.getRoleOrder());
                                                audit.setChangedBy(username);
                                                audit.setAction("UPDATE");
                                                audit.setPreviousValues(prevJson);
                                                audit.setNewValues(toJson(saved));
                                                audit.setChangedAt(Instant.now());

                                                return auditRepository.save(audit)
                                                        .onErrorResume(e -> Mono.empty())
                                                        .thenReturn(DashboardSettingsConverter.toDto(saved));
                                            });
                                        });
                                    });
                        }));
    }

    private Mono<Integer> resolveTargetRoleOrder(String roleName, Integer requestedOrder) {
        if (requestedOrder != null && requestedOrder >= 1 && requestedOrder <= 3) {
            return Mono.just(requestedOrder);
        }

        return userRoleRepository.findByName(roleName)
                .map(UserRoleEntity::getRoleOrder)
                .defaultIfEmpty(deriveFallbackOrder(roleName));
    }

    private int deriveFallbackOrder(String roleName) {
        if ("SUPER ADMIN".equalsIgnoreCase(roleName) || "SUPERADMIN".equalsIgnoreCase(roleName)) return 1;
        if ("ADMIN".equalsIgnoreCase(roleName)) return 2;
        return 3;
    }

    private String toJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            return "{}";
        }
    }
}

