package com.puff.tech.usermanagement.usecase.role;

import com.puff.tech.core.usecases.MonoUC;
import com.puff.tech.onboarding.repository.UserInfoEntity;
import com.puff.tech.onboarding.repository.UserInfoRepository;
import com.puff.tech.security.UseCaseContext;
import com.puff.tech.usermanagement.repository.UserPermissionEntity;
import com.puff.tech.usermanagement.repository.UserPermissionRepository;
import com.puff.tech.usermanagement.repository.UserRoleEntity;
import com.puff.tech.usermanagement.repository.UserRoleRepository;
import com.puff.tech.usermanagement.usecase.role.payload.AddUserRoleUCResponse;
import com.puff.tech.usermanagement.usecase.role.payload.UpdateRolePermissionUCRequest;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

import java.util.ArrayList;
import java.util.List;

@Singleton
public class UpdateRolePermissionUC implements MonoUC<UpdateRolePermissionUCRequest, AddUserRoleUCResponse> {

    private final UserRoleRepository roleRepository;
    private final UserPermissionRepository permissionRepository;
    private final UserInfoRepository userInfoRepository;

    public UpdateRolePermissionUC(UserRoleRepository roleRepository,
                                  UserPermissionRepository permissionRepository,
                                  UserInfoRepository userInfoRepository) {
        this.roleRepository = roleRepository;
        this.permissionRepository = permissionRepository;
        this.userInfoRepository = userInfoRepository;
    }

    @Override
    public Mono<AddUserRoleUCResponse> execute(UpdateRolePermissionUCRequest request, UseCaseContext context) {
        if (request.id() == null) {
            return Mono.error(new IllegalArgumentException("Role ID is required for update"));
        }

        // 1. Fetch existing role or throw exception
        return roleRepository.findById(request.id().intValue())
                .switchIfEmpty(Mono.error(new IllegalArgumentException("Role not found with ID: " + request.id())))
                .flatMap(existingRole -> {

                    // 2. Update role basic fields
                    if (request.name() != null) {
                        existingRole.setName(request.name());
                    }
                    if (request.description() != null) {
                        existingRole.setDescription(request.description());
                    }

                    // 3. Clear existing child permissions if new list is provided
                    if (request.permissions() != null) {
                        if (existingRole.getPermissions() != null) {
                            existingRole.getPermissions().clear();
                        } else {
                            existingRole.setPermissions(new ArrayList<>());
                        }

                        // Map new permissions and bind parent reference
                        List<UserPermissionEntity> newPermissions = request.permissions().stream()
                                .map(pReq -> UserPermissionEntity.builder()
                                        .role(existingRole)
                                        .module(pReq.module())
                                        .permissions(pReq.permissions())
                                        .build())
                                .toList();

                        existingRole.getPermissions().addAll(newPermissions);
                    }

                    // 4. Save and update role entity
                    return roleRepository.update(existingRole);
                })
                .flatMap(updatedRole -> {
                    if (request.permissions() == null) {
                        return Mono.just(updatedRole);
                    }

                    // 5. Re-create permissions and update dependent users
                    return permissionRepository.deleteByRoleId(updatedRole.getId())
                            .then(permissionRepository.saveAll(updatedRole.getPermissions()).collectList())
                            .flatMap(savedPermissions -> {
                                // Extract newly generated permission IDs -> [5, 6, 7]
                                List<Integer> permissionIds = savedPermissions.stream()
                                        .map(UserPermissionEntity::getId)
                                        .toList();

                                String permissionJson = permissionIds.toString(); // Output format: "[5, 6, 7]"

                                // 6. Update permission column for all users assigned to this role ID
                                return updateUsersPermissionByRole(String.valueOf(updatedRole.getId()), permissionJson)
                                        .then(Mono.just(updatedRole));
                            });
                })
                .map(this::mapToResponse);
    }

    private Mono<Void> updateUsersPermissionByRole(String roleId, String newPermissionsJson) {
        // Option A: If you added batch update directly in UserInfoRepository
        return userInfoRepository.updatePermissionByRole(roleId, newPermissionsJson).then();

        /*
        // Option B: If updating via reactive stream iterate (fallback if no bulk query method exists)
        return userInfoRepository.findByRole(roleId)
                .flatMap(user -> {
                    user.setPermission(newPermissionsJson);
                    return userInfoRepository.update(user);
                })
                .then();
        */
    }

    private AddUserRoleUCResponse mapToResponse(UserRoleEntity roleEntity) {

        return new AddUserRoleUCResponse(
                roleEntity.getId(),
               "Role And Permission Updated Successfully !!"
        );
    }
}
