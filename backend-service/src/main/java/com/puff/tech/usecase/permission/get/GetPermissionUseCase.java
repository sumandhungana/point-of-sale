package com.puff.tech.usecase.permission.get;

import com.puff.tech.covertor.PermissionConvertor;
import com.puff.tech.repository.PermissionRepository;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Flux;


@Singleton
public class GetPermissionUseCase {

    private final PermissionRepository permissionRepository;

    @Inject
    public GetPermissionUseCase(PermissionRepository permissionRepository){
        this.permissionRepository= permissionRepository;
    }

    public Flux<GetPermissionUseCaseResponse> execute(){
        return permissionRepository.findAllOrderByCreatedAtDesc()
                .map(PermissionConvertor::toResponse)
                .onErrorResume(err-> Flux.error(new RuntimeException("Unexpected happened" +err.getLocalizedMessage())));
    }
}
