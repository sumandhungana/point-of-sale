package com.puff.tech.usecase.role.getone;

import com.puff.tech.core.usecases.UseCase;
import com.puff.tech.covertor.RoleConvertor;
import com.puff.tech.repository.RoleRepository;
import com.puff.tech.usecase.role.get.GetRoleUseCaseResponse;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class GetOneRoleUseCase implements UseCase<GetOneRoleUseCaseRequest, GetRoleUseCaseResponse> {

    private final RoleRepository roleRepository;

    @Inject
    public GetOneRoleUseCase(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    @Override
    public Mono<GetRoleUseCaseResponse> execute(GetOneRoleUseCaseRequest request) {
        return roleRepository.findById(request.id())
                .map(RoleConvertor::toResponse)
                .onErrorResume(err->Mono.error(new RuntimeException("Unexpected happened" +err.getLocalizedMessage())));
    }
}
