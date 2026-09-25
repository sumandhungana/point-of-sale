package com.puff.tech.security;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
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

    @Inject
    public SecurityDataService(UserRoleRepository userRoleRepository, UserPermissionRepository userPermissionRepository) {
        this.userRoleRepository = userRoleRepository;
        this.userPermissionRepository = userPermissionRepository;
    }

    public Mono<RolePermissionDetails> fetchSecurityDetails(Long roleId, String permissionIdsStr, Long memberId) {
        if (roleId == null) {
            return Mono.empty();
        }

        int intRoleId = roleId.intValue();
        List<Integer> permissionIds = parsePermissionIds(permissionIdsStr);

        // 1. Fetch Role Entity from UserRoleRepository
        Mono<RolePermissionDetails> roleMono = (memberId != null)
                ? userRoleRepository.findByIdAndMemberId(intRoleId, memberId).map(role -> new RolePermissionDetails(
                role.getName(),
                null,
                "ACTIVE".equalsIgnoreCase(role.getStatus())
        ))
                : userRoleRepository.findById(intRoleId).map(role -> new RolePermissionDetails(
                role.getName(),
                null,
                "ACTIVE".equalsIgnoreCase(role.getStatus())
        ));

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
