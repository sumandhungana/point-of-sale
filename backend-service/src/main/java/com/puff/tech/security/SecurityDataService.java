package com.puff.tech.security;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.puff.tech.onboarding.repository.UserMemberRepository;
import com.puff.tech.usermanagement.repository.UserPermissionEntity;
import com.puff.tech.usermanagement.repository.UserPermissionRepository;
import com.puff.tech.usermanagement.repository.UserRoleRepository;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

import java.util.*;
import java.util.stream.Collectors;

@Singleton
public class SecurityDataService {

private final UserRoleRepository userRoleRepository;
    private final UserPermissionRepository userPermissionRepository;
    private static final ObjectMapper objectMapper = new ObjectMapper();
    private static final Long ADMIN_ROLE_ID = 1L;
    private static final int SUPER_ADMIN_ROLE_ORDER = 1; // Super Admin role is default created
    private static final int ADMIN_ROLE = 2; // Any role name that is created by Super Admin is considered as Admin Role
    private static final int USER_ROLE = 3; // Any role that is created by Admin is User Role (Name Can be anything)
    private final UserMemberRepository userMemberRepository;

    @Inject
    public SecurityDataService(UserRoleRepository userRoleRepository, UserPermissionRepository userPermissionRepository, UserMemberRepository userMemberRepository) {
        this.userRoleRepository = userRoleRepository;
        this.userPermissionRepository = userPermissionRepository;
        this.userMemberRepository = userMemberRepository;
    }

    public Mono<RolePermissionDetails> fetchSecurityDetails(Long roleId, String permissionIdsStr, Long memberId, String userId) {
        if (roleId == null) {
            return Mono.empty();
        }

        int intRoleId = roleId.intValue();
        List<Integer> permissionIds = parsePermissionIds(permissionIdsStr);
        Mono<RolePermissionDetails> roleMono = userRoleRepository.findById(intRoleId)
                .flatMap(userRole -> {
                    boolean isActive = "ACTIVE".equalsIgnoreCase(userRole.getStatus());
                    RolePermissionDetails details = new RolePermissionDetails(userRole.getName(), null, isActive);

                    int roleOrder = userRole.getRoleOrder();

                    // 1. Admin path: check existence, filter true, map to details
                    Mono<RolePermissionDetails> adminPath = Mono.just(roleOrder)
                            .filter(order -> order == ADMIN_ROLE)
                            .flatMap(order -> userMemberRepository.existsByUserIdAndMemberId(Long.parseLong(userId), memberId))
                            .filter(Boolean::booleanValue)
                            .map(exists -> details);

                    // 2. Standard role path (Super Admin or Standard User)
                    Mono<RolePermissionDetails> standardRolePath = Mono.just(roleOrder)
                            .filter(order -> order == SUPER_ADMIN_ROLE_ORDER || order == USER_ROLE)
                            .map(order -> details);

                    // Chain paths using switchIfEmpty
                    return adminPath.switchIfEmpty(standardRolePath);
                });

        // 2. Fetch Permissions using UserPermissionRepository based on roleId and permissionIds
        Mono<Set<String>> permissionsMono = fetchPermissions(intRoleId, permissionIds);

        // 3. Zip results into RolePermissionDetails
        return Mono.zip(roleMono, permissionsMono)
                .map(tuple -> {
                    RolePermissionDetails details = tuple.getT1();
                    Set<String> permissions = tuple.getT2();

                    return new RolePermissionDetails(
                            details.roleName(),
                            permissions,
                            details.enabled()
                    );
                });
    }

    private Mono<Set<String>> fetchPermissions(int roleId, List<Integer> permissionIds) {
        // Query UserPermissionRepository by roleId and optionally filter by permission IDs
        var permissionsFlux = permissionIds.isEmpty()
                ? userPermissionRepository.findByRoleId(roleId)
                : userPermissionRepository.findByRoleIdAndIdIn(roleId, permissionIds);

        return permissionsFlux
                .map(UserPermissionEntity::getPermissions)
                .filter(Objects::nonNull)
                .flatMapIterable(perms -> perms)
                .collect(Collectors.toSet())
                .defaultIfEmpty(Collections.emptySet());
    }

    private List<Integer> parsePermissionIds(String permissionIdsStr) {
        if (permissionIdsStr == null || permissionIdsStr.isBlank()) {
            return Collections.emptyList();
        }

        try {
            if (permissionIdsStr.trim().startsWith("[")) {
                return objectMapper.readValue(permissionIdsStr, new TypeReference<List<Integer>>() {});
            } else {
                return Arrays.stream(permissionIdsStr.split(","))
                        .map(String::trim)
                        .map(Integer::parseInt)
                        .collect(Collectors.toList());
            }
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }
}
