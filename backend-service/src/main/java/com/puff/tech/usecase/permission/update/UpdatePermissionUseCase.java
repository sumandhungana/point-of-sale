package com.puff.tech.usecase.permission.update;

import com.puff.tech.core.usecases.UseCase;
import com.puff.tech.covertor.PermissionConvertor;
import com.puff.tech.repository.PermissionRepository;
import jakarta.inject.Inject;
import reactor.core.publisher.Mono;

public class UpdatePermissionUseCase implements UseCase<UpdatePermissionUseCaseRequest,UpdatePermissionUseCaseResponse> {

    private final PermissionRepository permissionRepository;

    @Inject
    public UpdatePermissionUseCase(PermissionRepository permissionRepository) {
        this.permissionRepository = permissionRepository;
    }

    @Override
    public Mono<UpdatePermissionUseCaseResponse> execute(UpdatePermissionUseCaseRequest request) {
        return permissionRepository.findById(request.id())
                .switchIfEmpty(Mono.error(new RuntimeException("Permission not found")))
                .flatMap(permissionEntity -> {
                    var updated= PermissionConvertor.toUpdateEntity(request,permissionEntity);
                    return permissionRepository.update(updated)
                            .map(newPermission->new UpdatePermissionUseCaseResponse("Permission updated successfully"))
                            .onErrorResume(err->Mono.error(new RuntimeException("Unxpected happened" +err.getLocalizedMessage())));
                });
    }
}
