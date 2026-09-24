package com.puff.tech.usermanagement.usecase.role;

import com.puff.tech.core.usecases.MonoUC;
import com.puff.tech.security.UseCaseContext;
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

        // 1. Save role
        UserRoleEntity roleEntity = UserRoleEntity.builder()
                .memberId(memberId)
                .name(request.name())
                .description(request.description())
                .status("ACTIVE")
                .build();

        return roleRepository.save(roleEntity)
                .flatMap(savedRole -> {
                    // 2. Save permissions
                    List<UserPermissionEntity> permissionEntities = request.permissions().stream()
                            .map(pReq -> UserPermissionEntity.builder()
                                    .role(savedRole)
                                    .module(pReq.module())
                                    .permissions(pReq.permissions())
                                    .build())
                            .toList();

                    return permissionRepository.saveAll(permissionEntities)
                            .then(Mono.just(AddUserRoleUCResponse.success(savedRole.getId())));
                });
    }
}
