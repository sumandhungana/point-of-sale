package com.puff.tech.usecase.permission.getone;

import com.puff.tech.core.usecases.UseCase;
import com.puff.tech.covertor.PermissionConvertor;
import com.puff.tech.repository.PermissionRepository;
import com.puff.tech.usecase.permission.get.GetPermissionUseCaseResponse;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class GetOnePermissionUseCase implements UseCase<GetOnePermissionUseCaseRequest, GetPermissionUseCaseResponse> {

    private final PermissionRepository permissionRepository;

    @Inject
    public GetOnePermissionUseCase(PermissionRepository permissionRepository) {
        this.permissionRepository = permissionRepository;
    }

    @Override
    public Mono<GetPermissionUseCaseResponse> execute(GetOnePermissionUseCaseRequest request) {
        return permissionRepository.findById(request.id())
                .map(PermissionConvertor::toResponse)
                .onErrorResume(err->Mono.error(new RuntimeException("Unexpected happened" +err.getLocalizedMessage())));
    }
}
