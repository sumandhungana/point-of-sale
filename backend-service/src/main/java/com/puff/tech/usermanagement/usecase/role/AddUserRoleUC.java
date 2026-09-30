package com.puff.tech.usermanagement.usecase.role;

import com.puff.tech.core.usecases.MonoUC;
import com.puff.tech.security.UseCaseContext;
import com.puff.tech.usermanagement.enums.Status;
import com.puff.tech.usermanagement.repository.UserPermissionEntity;
import com.puff.tech.usermanagement.repository.UserPermissionRepository;
import com.puff.tech.usermanagement.repository.UserRoleEntity;
import com.puff.tech.usermanagement.repository.UserRoleRepository;
import com.puff.tech.usermanagement.usecase.role.payload.AddUserRoleUCRequest;
import com.puff.tech.usermanagement.usecase.role.payload.AddUserRoleUCResponse;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

import java.util.List;

@Singleton
public class AddUserRoleUC implements MonoUC<AddUserRoleUCRequest, AddUserRoleUCResponse> {

    private final UserRoleRepository roleRepository;
    private final UserPermissionRepository permissionRepository;

    public AddUserRoleUC(UserRoleRepository roleRepository,
                         UserPermissionRepository permissionRepository) {
        this.roleRepository = roleRepository;
        this.permissionRepository = permissionRepository;
    }

    @Override
    public Mono<AddUserRoleUCResponse> execute(AddUserRoleUCRequest request, UseCaseContext context) {
        Long memberId = context.securityContext().memberId();
        String firstRole = context.securityContext().roles().getFirst();

        return Mono.fromCallable(() -> firstRole)
                .flatMap(roleRepository::findByName)
                .flatMap(roleEntity -> calculateNextRoleOrder(roleEntity.getRoleOrder()))
                .map(newRoleOrder -> buildUserRoleEntity(request, memberId, newRoleOrder))
                .flatMap(roleRepository::save)
                .flatMap(savedRole -> savePermissions(savedRole, request.permissions()))
                .map(savedRole -> AddUserRoleUCResponse.success(savedRole.getId()));
    }

    private Mono<Integer> calculateNextRoleOrder(Integer currentRoleOrder) {
        return Mono.justOrEmpty(currentRoleOrder)
                .filter(order -> order >= 1)
                .map(order -> order + 1)
                .switchIfEmpty(Mono.error(new IllegalArgumentException("Invalid or missing parent role order")));
    }

    private UserRoleEntity buildUserRoleEntity(AddUserRoleUCRequest request, Long memberId, int roleOrder) {
        return UserRoleEntity.builder()
                .memberId(memberId)
                .name(request.name())
                .description(request.description())
                .status(Status.ACTIVE.name())
                .roleOrder(roleOrder)
                .build();
    }

    private Mono<UserRoleEntity> savePermissions(UserRoleEntity savedRole, List<AddUserRoleUCRequest.PermissionRequest> permissions) {
        if (permissions == null || permissions.isEmpty()) {
            return Mono.just(savedRole);
        }

        List<UserPermissionEntity> permissionEntities = permissions.stream()
                .map(pReq -> UserPermissionEntity.builder()
                        .role(savedRole)
                        .module(pReq.module())
                        .permissions(pReq.permissions())
                        .build())
                .toList();

        return permissionRepository.saveAll(permissionEntities)
                .then(Mono.just(savedRole));
    }
}
