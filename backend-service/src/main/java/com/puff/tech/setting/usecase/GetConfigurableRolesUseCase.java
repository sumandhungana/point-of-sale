package com.puff.tech.setting.usecase;

import com.puff.tech.core.usecases.FluxUC;
import com.puff.tech.core.usecases.UCRequest;
import com.puff.tech.onboarding.repository.UserInfoRepository;
import com.puff.tech.onboarding.repository.UserMemberRepository;
import com.puff.tech.security.UseCaseContext;
import com.puff.tech.setting.usecase.request.RoleOrderDto;
import com.puff.tech.usermanagement.repository.UserRoleEntity;
import com.puff.tech.usermanagement.repository.UserRoleRepository;
import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;
import jakarta.annotation.Nonnull;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.*;

@Singleton
public class GetConfigurableRolesUseCase implements FluxUC<GetConfigurableRolesUseCase.Request, RoleOrderDto> {

    @Serdeable
    @Introspected
    public record Request() implements UCRequest {}

    private final UserRoleRepository userRoleRepository;
    private final UserMemberRepository userMemberRepository;

    public GetConfigurableRolesUseCase(UserRoleRepository userRoleRepository,
                                       UserMemberRepository userMemberRepository) {
        this.userRoleRepository = userRoleRepository;
        this.userMemberRepository = userMemberRepository;
    }

    @Override
    public Flux<RoleOrderDto> execute(Request request, UseCaseContext context) {
        Long memberId = context != null && context.securityContext() != null ? context.securityContext().memberId() : null;
        String userId = context != null && context.securityContext() != null ? context.securityContext().userId() : "";
        if (userId.isBlank() || memberId == null) {
            return Flux.empty();
        }
        return userMemberRepository.findByUserIdAndMemberId(Long.valueOf(userId), memberId)
                .switchIfEmpty(Mono.empty())
                .flatMapMany(userMember -> {
                    if (userMember.getUser() == null || userMember.getUser().getRole() == null) {
                        return Flux.empty();
                    }

                    int roleId;
                    try {
                        roleId = Integer.parseInt(userMember.getUser().getRole());
                    } catch (NumberFormatException e) {
                        return Flux.empty();
                    }

                    return userRoleRepository.findById(roleId)
                            .switchIfEmpty(Mono.empty())
                            .flatMapMany(role -> {
                                List<Integer> targetOrders = getTargetOrders(role);

                                if (targetOrders.isEmpty()) {
                                    return Flux.empty();
                                }

                                return userRoleRepository.findAll()
                                        .filter(r -> r.getRoleOrder() != null && targetOrders.contains(r.getRoleOrder()))
                                        .map(r -> RoleOrderDto.builder()
                                                .id(r.getId())
                                                .name(r.getName())
                                                .description(r.getDescription())
                                                .roleOrder(r.getRoleOrder())
                                                .build());
                            });
                })
                .sort(Comparator.comparingInt((RoleOrderDto r) -> r.roleOrder() != null ? r.roleOrder() : 99)
                        .thenComparing(RoleOrderDto::name));
    }

    @Nonnull
    private static List<Integer> getTargetOrders(UserRoleEntity role) {
        Integer roleOrder = role.getRoleOrder();
        List<Integer> targetOrders = new ArrayList<>();

        if (roleOrder != null) {
            if (roleOrder == 1) {
                // Find all roles having order 1 and 2
                targetOrders = List.of(1, 2);
            } else if (roleOrder == 2) {
                // Find all roles having order 3
                targetOrders = List.of(3);
            }
        }
        return targetOrders;
    }

    public Mono<Integer> resolveCallerRoleOrder(String roleName) {
        if (roleName == null) return Mono.just(3);
        String normalized = roleName.trim().toUpperCase();
        if (normalized.equals("SUPER ADMIN") || normalized.equals("SUPERADMIN")) {
            return Mono.just(1);
        }
        if (normalized.equals("ADMIN")) {
            return Mono.just(2);
        }

        return userRoleRepository.findByName(roleName)
                .map(r -> r.getRoleOrder() != null ? r.getRoleOrder() : 3)
                .defaultIfEmpty(3);
    }



}
