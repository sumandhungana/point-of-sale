package com.puff.tech.usecase.permission.getbymodule;

import com.puff.tech.core.usecases.UseCase;
import com.puff.tech.covertor.PermissionConvertor;
import com.puff.tech.repository.PermissionRepository;
import com.puff.tech.usecase.permission.get.GetPermissionUseCaseResponse;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public class GetPermissionByModuleUseCase {

    private final PermissionRepository permissionRepository;

    public GetPermissionByModuleUseCase(PermissionRepository permissionRepository){
        this.permissionRepository=permissionRepository;
    }

    public Flux<GetPermissionUseCaseResponse> execute(GetPermissionByModuleUseCaseRequest request) {
        return permissionRepository.findByModule(request.module())
                .map(PermissionConvertor::toResponse)
                .onErrorResume(err->Flux.error(new RuntimeException("Unexpected happened" +err.getLocalizedMessage())));
    }
}
