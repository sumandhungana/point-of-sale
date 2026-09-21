package com.puff.tech.usecase.role.createpermission;

import com.puff.tech.core.usecases.UseCases;
import com.puff.tech.entity.RolePermissionEntity;
import com.puff.tech.repository.PermissionRepository;
import com.puff.tech.repository.RolePermissionRepository;
import com.puff.tech.repository.RoleRepository;
import jakarta.inject.Inject;
import reactor.core.publisher.Mono;

public class CreatePermissionToRoleUseCase implements UseCases<CreatePermissionToRoleUseCaseRequest, CreatePermissionToRoleUseCaseResponse> {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final RolePermissionRepository rolePermissionRepository;

    @Inject
    public CreatePermissionToRoleUseCase(RoleRepository roleRepository,
                                         PermissionRepository permissionRepository,
                                         RolePermissionRepository rolePermissionRepository) {
        this.roleRepository = roleRepository;
        this.permissionRepository = permissionRepository;
        this.rolePermissionRepository = rolePermissionRepository;
    }

    @Override
    public Mono<CreatePermissionToRoleUseCaseResponse> execute(
            CreatePermissionToRoleUseCaseRequest request
    ) {

        return roleRepository.findById(request.roleId())
                .switchIfEmpty(Mono.error(new RuntimeException("Role not found")))
                .flatMap(role ->
                        permissionRepository.findByIdIn(request.permissionIds())
                                .flatMap(permission ->
                                        rolePermissionRepository
                                                .existsByRoleIdAndPermissionId(
                                                        request.roleId(),
                                                        permission.getId()
                                                )
                                                .filter(exists -> !exists)
                                                .flatMap(exists -> {

                                                    RolePermissionEntity entity =
                                                            new RolePermissionEntity();

                                                    entity.setRoleId(request.roleId());
                                                    entity.setPermissionId(permission.getId());

                                                    return rolePermissionRepository.save(entity);
                                                })
                                )
                                .then(
                                        Mono.just(
                                                new CreatePermissionToRoleUseCaseResponse(
                                                        "Permission created successfully"
                                                )
                                        )
                                )
                );
    }
}
