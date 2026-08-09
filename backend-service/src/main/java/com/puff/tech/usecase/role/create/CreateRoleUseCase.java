package com.puff.tech.usecase.role.create;

import com.puff.tech.core.usecases.UseCase;
import com.puff.tech.covertor.RoleConvertor;
import com.puff.tech.repository.RoleRepository;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class CreateRoleUseCase implements UseCase<CreateRoleUseCaseRequest,CreateRoleUseCaseResponse> {

    private final RoleRepository roleRepository;

    @Inject
    public CreateRoleUseCase(RoleRepository roleRepository){
        this.roleRepository=roleRepository;
    }

    @Override
    public Mono<CreateRoleUseCaseResponse> execute(CreateRoleUseCaseRequest request) {
        var role= RoleConvertor.toEntity(request);
        return roleRepository.save(role)
                .map(roleEntity -> new CreateRoleUseCaseResponse("Role created"))
                .onErrorResume(err->Mono.error(new RuntimeException("Unexpected happened" +err.getLocalizedMessage())));
    }
}
