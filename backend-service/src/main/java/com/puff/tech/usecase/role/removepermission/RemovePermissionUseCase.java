package com.puff.tech.usecase.role.removepermission;

import com.puff.tech.core.usecases.UseCases;
import com.puff.tech.repository.RolePermissionRepository;
import jakarta.inject.Inject;
import reactor.core.publisher.Mono;

public class RemovePermissionUseCase implements UseCases<RemovePermissionUseCaseRequest,RemovePermissionUseCaseResponse> {

    private final RolePermissionRepository rolePermissionRepository;

    @Inject
    public RemovePermissionUseCase(RolePermissionRepository rolePermissionRepository) {
        this.rolePermissionRepository = rolePermissionRepository;
    }

    @Override
    public Mono<RemovePermissionUseCaseResponse> execute(RemovePermissionUseCaseRequest request) {
        return rolePermissionRepository.findByRoleIdAndPermissionIdIn(request.roleId(), request.permissionIds())
                .flatMap(rolePermissionRepository::delete)
                .then(Mono.just(new RemovePermissionUseCaseResponse("Permission removed to role")));
    }
}
