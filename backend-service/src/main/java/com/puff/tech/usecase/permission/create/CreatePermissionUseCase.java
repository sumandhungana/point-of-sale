package com.puff.tech.usecase.permission.create;

import com.puff.tech.core.usecases.UseCase;
import com.puff.tech.covertor.PermissionConvertor;
import com.puff.tech.repository.PermissionRepository;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class CreatePermissionUseCase implements UseCase<CreatePermissionUseCaseRequest,CreatePermissionUseCaseResponse> {

    private final PermissionRepository permissionRepository;

    @Inject
    public CreatePermissionUseCase(PermissionRepository permissionRepository){
        this.permissionRepository=permissionRepository;
    }

    @Override
    public Mono<CreatePermissionUseCaseResponse> execute(CreatePermissionUseCaseRequest request) {
        var permission= PermissionConvertor.toEntity(request);
        return permissionRepository.save(permission)
                .map(permissionEntity -> new CreatePermissionUseCaseResponse("New permission created"))
                .onErrorResume(err->Mono.error(new RuntimeException("Unexpected happened" +err.getLocalizedMessage())));
    }
}
