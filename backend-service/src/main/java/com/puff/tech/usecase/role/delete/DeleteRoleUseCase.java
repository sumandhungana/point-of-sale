package com.puff.tech.usecase.role.delete;

import com.puff.tech.core.usecases.UseCase;
import com.puff.tech.repository.RoleRepository;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class DeleteRoleUseCase implements UseCase<DeleteRoleUseCaseRequest,DeleteRoleUseCaseResponse> {

    private final RoleRepository roleRepository;

    @Inject
    public DeleteRoleUseCase(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    @Override
    public Mono<DeleteRoleUseCaseResponse> execute(DeleteRoleUseCaseRequest request) {
        return roleRepository.findById(request.id())
                .switchIfEmpty(Mono.error(new RuntimeException("Role not found")))
                .flatMap(roleEntity ->
                        roleRepository.deleteById(request.id())
                                .then(Mono.just(new DeleteRoleUseCaseResponse("Role deleted successfully")))
                                .onErrorResume(err->Mono.error(new RuntimeException("Unexpected happened" +err.getLocalizedMessage()))));
    }
}
