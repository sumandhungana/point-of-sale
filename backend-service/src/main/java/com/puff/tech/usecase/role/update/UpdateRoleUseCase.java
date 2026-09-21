package com.puff.tech.usecase.role.update;

import com.puff.tech.core.usecases.UseCases;
import com.puff.tech.covertor.RoleConvertor;
import com.puff.tech.repository.RoleRepository;
import jakarta.inject.Inject;
import reactor.core.publisher.Mono;

public class UpdateRoleUseCase implements UseCases<UpdateRoleUseCaseRequest,UpdateRoleUseCaseResponse> {

    private final RoleRepository roleRepository;

    @Inject
    public UpdateRoleUseCase(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    @Override
    public Mono<UpdateRoleUseCaseResponse> execute(UpdateRoleUseCaseRequest request) {
        return roleRepository.findById(request.id())
                .switchIfEmpty(Mono.error(new RuntimeException("Role not found")))
                .flatMap(roleEntity -> {
                    var updated= RoleConvertor.toEntityUpdate(request,roleEntity);
                    return roleRepository.save(updated)
                            .map(role->new UpdateRoleUseCaseResponse("Role updated successfully"))
                            .onErrorResume(err->Mono.error(new RuntimeException("Unexpected happened" +err.getLocalizedMessage())));
                });
    }
}
