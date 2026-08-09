package com.puff.tech.controller;

import com.puff.tech.core.responses.RestResponse;
import com.puff.tech.usecase.permission.create.CreatePermissionUseCase;
import com.puff.tech.usecase.permission.create.CreatePermissionUseCaseRequest;
import com.puff.tech.usecase.permission.create.CreatePermissionUseCaseResponse;
import com.puff.tech.usecase.permission.delete.DeletePermissionUseCase;
import com.puff.tech.usecase.permission.delete.DeletePermissionUseCaseRequest;
import com.puff.tech.usecase.permission.delete.DeletePermissionUseCaseResponse;
import com.puff.tech.usecase.permission.get.GetPermissionUseCase;
import com.puff.tech.usecase.permission.get.GetPermissionUseCaseResponse;
import com.puff.tech.usecase.permission.getbymodule.GetPermissionByModuleUseCase;
import com.puff.tech.usecase.permission.getbymodule.GetPermissionByModuleUseCaseRequest;
import com.puff.tech.usecase.permission.getone.GetOnePermissionUseCase;
import com.puff.tech.usecase.permission.getone.GetOnePermissionUseCaseRequest;
import com.puff.tech.usecase.permission.update.UpdatePermissionUseCase;
import com.puff.tech.usecase.permission.update.UpdatePermissionUseCaseRequest;
import com.puff.tech.usecase.permission.update.UpdatePermissionUseCaseResponse;
import io.micronaut.http.annotation.*;
import jakarta.inject.Inject;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Controller("/api/v1")
public class PermissionController {

    private final CreatePermissionUseCase createPermissionUseCase;
    private final GetPermissionUseCase getPermissionUseCase;
    private final GetPermissionByModuleUseCase getPermissionByModuleUseCase;
    private final GetOnePermissionUseCase getOnePermissionUseCase;
    private final UpdatePermissionUseCase updatePermissionUseCase;
    private final DeletePermissionUseCase deletePermissionUseCase;

    @Inject
    public PermissionController(CreatePermissionUseCase createPermissionUseCase,
                                GetPermissionUseCase getPermissionUseCase,
                                GetPermissionByModuleUseCase getPermissionByModuleUseCase,
                                GetOnePermissionUseCase getOnePermissionUseCase,
                                UpdatePermissionUseCase updatePermissionUseCase,
                                DeletePermissionUseCase deletePermissionUseCase) {
        this.createPermissionUseCase = createPermissionUseCase;
        this.getPermissionUseCase = getPermissionUseCase;
        this.getPermissionByModuleUseCase = getPermissionByModuleUseCase;
        this.getOnePermissionUseCase = getOnePermissionUseCase;
        this.updatePermissionUseCase = updatePermissionUseCase;
        this.deletePermissionUseCase = deletePermissionUseCase;
    }

    @Post("/permission")
    public Mono<RestResponse<CreatePermissionUseCaseResponse>> create(@Body CreatePermissionUseCaseRequest request){
        return createPermissionUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err-> Mono.just(RestResponse.error("Unexpected on controller" +err.getLocalizedMessage())));
    }

    @Get("/permission")
    public Flux<RestResponse<GetPermissionUseCaseResponse>> get(){
        return getPermissionUseCase.execute()
                .map(RestResponse::success)
                .onErrorResume(err-> Mono.just(RestResponse.error("Unexpected on controller" +err.getLocalizedMessage())));
    }

    @Get("/permission/{module}")
    public Flux<RestResponse<GetPermissionUseCaseResponse>> getByModule(String module){
        var request= new GetPermissionByModuleUseCaseRequest(module);
        return getPermissionByModuleUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err-> Mono.just(RestResponse.error("Unexpected on controller" +err.getLocalizedMessage())));
    }

    @Get("/permission/{id}")
    public Mono<RestResponse<GetPermissionUseCaseResponse>> getOne(@PathVariable Integer id){
        var request= new GetOnePermissionUseCaseRequest(id);
        return getOnePermissionUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err-> Mono.just(RestResponse.error("Unexpected on controller" +err.getLocalizedMessage())));
    }

    @Put("/permission")
    public Mono<RestResponse<UpdatePermissionUseCaseResponse>> update(@Body UpdatePermissionUseCaseRequest request){
        return updatePermissionUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err-> Mono.just(RestResponse.error("Unexpected on controller" +err.getLocalizedMessage())));
    }

    @Delete("/permission/{id}")
    public Mono<RestResponse<DeletePermissionUseCaseResponse>> delete(@PathVariable Integer id){
        var request= new DeletePermissionUseCaseRequest(id);
        return deletePermissionUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err-> Mono.just(RestResponse.error("Unexpected on controller" +err.getLocalizedMessage())));
    }
}
