package com.puff.tech.usecase.role.get;

import com.puff.tech.covertor.RoleConvertor;
import com.puff.tech.repository.RoleRepository;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Flux;

@Singleton
public class GetRoleUseCase {

    private final RoleRepository roleRepository;

    @Inject
    public GetRoleUseCase(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    public Flux<GetRoleUseCaseResponse> execute(){
        return roleRepository.findAllOrderByCreatedAtDesc()
                .map(RoleConvertor::toResponse)
                .onErrorResume(err->Flux.error(new RuntimeException("Unexpected happened" +err.getLocalizedMessage())));
    }
}
