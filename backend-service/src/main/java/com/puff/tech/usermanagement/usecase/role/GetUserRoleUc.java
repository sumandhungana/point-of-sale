package com.puff.tech.usermanagement.usecase.role;

import com.puff.tech.core.usecases.FluxUC;
import com.puff.tech.security.UseCaseContext;
import com.puff.tech.usermanagement.repository.UserPermissionRepository;
import com.puff.tech.usermanagement.repository.UserRoleRepository;
import com.puff.tech.usermanagement.usecase.role.payload.GetUserRoleUCRequest;
import com.puff.tech.usermanagement.usecase.role.payload.GetUserRoleUCResponse;
import jakarta.inject.Singleton;
import reactor.core.publisher.Flux;

import java.util.List;

@Singleton
public class GetUserRoleUc implements FluxUC<GetUserRoleUCRequest, GetUserRoleUCResponse> {

    private final UserRoleRepository roleRepository;
    private final UserPermissionRepository permissionRepository;

    public GetUserRoleUc(UserRoleRepository roleRepository,
                         UserPermissionRepository permissionRepository) {
        this.roleRepository = roleRepository;
        this.permissionRepository = permissionRepository;
    }

    @Override
    public Flux<GetUserRoleUCResponse> execute(GetUserRoleUCRequest request, UseCaseContext context) {
        Long memberId = context.securityContext().memberId();

        return roleRepository.findByMemberId(memberId)
                .flatMap(role -> permissionRepository.findByRoleId(role.getId())
                        .collectList()
                        .map(permissions -> {
                            List<GetUserRoleUCResponse.PermissionResponse> permissionResponses = permissions.stream()
                                    .map(p -> new GetUserRoleUCResponse.PermissionResponse(
                                            p.getId(),
                                            p.getModule(),
                                            p.getPermissions()
                                    ))
                                    .toList();

                            return new GetUserRoleUCResponse(
                                    role.getId(),
                                    role.getName(),
                                    role.getDescription(),
                                    role.getStatus(),
                                    permissionResponses,
                                    role.getCreatedAt(),
                                    role.getUpdatedAt()
                            );
                        })
                );
    }

}
