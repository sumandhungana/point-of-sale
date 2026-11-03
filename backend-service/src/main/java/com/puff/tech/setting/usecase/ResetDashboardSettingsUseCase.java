package com.puff.tech.setting.usecase;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.puff.tech.core.usecases.MonoUC;
import com.puff.tech.core.utils.JsonUtils;
import com.puff.tech.security.UseCaseContext;
import com.puff.tech.setting.DashboardSettingsConverter;
import com.puff.tech.setting.repository.DashboardSettingsAuditEntity;
import com.puff.tech.setting.repository.DashboardSettingsAuditRepository;
import com.puff.tech.setting.repository.DashboardSettingsEntity;
import com.puff.tech.setting.repository.DashboardSettingsRepository;
import com.puff.tech.setting.usecase.request.DashboardSettingUCDto;
import com.puff.tech.setting.usecase.request.ResetDashboardSettingUCRequest;
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
public class ResetDashboardSettingsUseCase implements MonoUC<ResetDashboardSettingUCRequest, DashboardSettingUCDto> {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    private final DashboardSettingsRepository dashboardSettingsRepository;
    private final DashboardSettingsAuditRepository auditRepository;
    private final UserRoleRepository userRoleRepository;
    private final GetConfigurableRolesUseCase configurableRolesUseCase;

    @Inject
    public ResetDashboardSettingsUseCase(DashboardSettingsRepository dashboardSettingsRepository,
                                         DashboardSettingsAuditRepository auditRepository,
                                         UserRoleRepository userRoleRepository,
                                         GetConfigurableRolesUseCase configurableRolesUseCase) {
        this.dashboardSettingsRepository = dashboardSettingsRepository;
        this.auditRepository = auditRepository;
        this.userRoleRepository = userRoleRepository;
        this.configurableRolesUseCase = configurableRolesUseCase;
    }

    @Override
    public Mono<DashboardSettingUCDto> execute(ResetDashboardSettingUCRequest request, UseCaseContext context) {
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
                .flatMap(callerRoleOrder -> userRoleRepository.findByName(targetRoleName)
                        .map(r -> r.getRoleOrder() != null ? r.getRoleOrder() : deriveDefaultOrder(targetRoleName))
                        .defaultIfEmpty(deriveDefaultOrder(targetRoleName))
                        .flatMap(targetRoleOrder -> {
                            // Check hierarchy permissions
                            if (callerRoleOrder == 1) {
                                if (targetRoleOrder != 1 && targetRoleOrder != 2) {
                                    return Mono.error(new HttpStatusException(HttpStatus.FORBIDDEN,
                                            "Super Admin can only reset Dashboard Settings for Order 1 and Order 2 roles."));
                                }
                            } else if (callerRoleOrder == 2) {
                                if (targetRoleOrder != 3) {
                                    return Mono.error(new HttpStatusException(HttpStatus.FORBIDDEN,
                                            "Admin can only reset Dashboard Settings for Order 3 roles."));
                                }
                            } else {
                                return Mono.error(new HttpStatusException(HttpStatus.FORBIDDEN,
                                        "Users with role order " + callerRoleOrder + " cannot modify dashboard settings."));
                            }

                            return dashboardSettingsRepository.findByMemberIdAndRoleName(memberId, targetRoleName)
                                    .flatMap(entity -> {
                                        String prevJson = toJson(entity);
                                        boolean isAdminTier = targetRoleOrder <= 2;
                                        String defaultType = targetRoleOrder == 1 ? "Super Admin" : targetRoleOrder == 2 ? "Admin" : targetRoleName;
                                        entity.setDashboardType(defaultType);
                                        entity.setEnabled(true);
                                        String defaultRows = isAdminTier ? DashboardSettingsConverter.DEFAULT_ADMIN_ROWS : DashboardSettingsConverter.DEFAULT_USER_ROWS;
                                        entity.setRowsConfig(defaultRows);
                                        entity.setShowSupplierChart(isAdminTier);
                                        entity.setShowCustomerChart(true);
                                        entity.setShowInventoryChart(isAdminTier);
                                        entity.setShowSystemMonitor(isAdminTier);
                                        entity.setUpdatedBy(username);
                                        entity.setUpdatedAt(Instant.now());

                                        return dashboardSettingsRepository.update(entity)
                                                .flatMap(saved -> {
                                                    DashboardSettingsAuditEntity audit = new DashboardSettingsAuditEntity();
                                                    audit.setDashboardSettingsId(saved.getId());
                                                    if (saved.getMember() != null) {
                                                        audit.setMember(saved.getMember());
                                                    }
                                                    audit.setRoleName(saved.getRoleName());
                                                    audit.setRoleOrder(saved.getRoleOrder());
                                                    audit.setChangedBy(username);
                                                    audit.setAction("RESET");
                                                    audit.setPreviousValues(prevJson);
                                                    audit.setNewValues(toJson(saved));
                                                    audit.setChangedAt(Instant.now());

                                                    return auditRepository.save(audit)
                                                            .onErrorResume(e -> Mono.empty())
                                                            .thenReturn(DashboardSettingsConverter.toDto(saved));
                                                });
                                    })
                                    .switchIfEmpty(Mono.just(DashboardSettingsConverter.createDefaultDto(targetRoleName, targetRoleOrder)));
                        }));
    }

    private int deriveDefaultOrder(String roleName) {
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

