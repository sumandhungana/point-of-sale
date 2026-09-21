package com.puff.tech.usecase.permission.delete;

import com.puff.tech.core.usecases.UseCases;
import com.puff.tech.repository.PermissionRepository;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class DeletePermissionUseCase implements UseCases<DeletePermissionUseCaseRequest,DeletePermissionUseCaseResponse> {

    private final PermissionRepository permissionRepository;

    @Inject
    public DeletePermissionUseCase(PermissionRepository permissionRepository){
        this.permissionRepository=permissionRepository;
    }

    @Override
    public Mono<DeletePermissionUseCaseResponse> execute(DeletePermissionUseCaseRequest request) {
        return permissionRepository.findById(request.id())
                .switchIfEmpty(Mono.error(new RuntimeException("Permission not found")))
                .flatMap(permissionEntity -> {
                    return permissionRepository.deleteById(request.id())
                            .then(Mono.just(new DeletePermissionUseCaseResponse("Permission deleted")))
                            .onErrorResume(err -> Mono.error(new RuntimeException("unexpected happened" + err.getLocalizedMessage())));
                } );
    }
}
