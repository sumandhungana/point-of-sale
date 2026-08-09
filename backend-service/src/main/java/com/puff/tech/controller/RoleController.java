package com.puff.tech.controller;

import com.puff.tech.core.responses.RestResponse;
import com.puff.tech.usecase.role.create.CreateRoleUseCase;
import com.puff.tech.usecase.role.create.CreateRoleUseCaseRequest;
import com.puff.tech.usecase.role.create.CreateRoleUseCaseResponse;
import com.puff.tech.usecase.role.createpermission.CreatePermissionToRoleUseCase;
import com.puff.tech.usecase.role.createpermission.CreatePermissionToRoleUseCaseRequest;
import com.puff.tech.usecase.role.createpermission.CreatePermissionToRoleUseCaseResponse;
import com.puff.tech.usecase.role.delete.DeleteRoleUseCase;
import com.puff.tech.usecase.role.delete.DeleteRoleUseCaseRequest;
import com.puff.tech.usecase.role.delete.DeleteRoleUseCaseResponse;
import com.puff.tech.usecase.role.get.GetRoleUseCase;
import com.puff.tech.usecase.role.get.GetRoleUseCaseResponse;
import com.puff.tech.usecase.role.getone.GetOneRoleUseCase;
import com.puff.tech.usecase.role.getone.GetOneRoleUseCaseRequest;
import com.puff.tech.usecase.role.removepermission.RemovePermissionUseCase;
import com.puff.tech.usecase.role.removepermission.RemovePermissionUseCaseRequest;
import com.puff.tech.usecase.role.removepermission.RemovePermissionUseCaseResponse;
import com.puff.tech.usecase.role.update.UpdateRoleUseCase;
import com.puff.tech.usecase.role.update.UpdateRoleUseCaseRequest;
import com.puff.tech.usecase.role.update.UpdateRoleUseCaseResponse;
import io.micronaut.http.annotation.*;
import jakarta.inject.Inject;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Controller("/api/v1")
public class RoleController {

    private final CreateRoleUseCase createRoleUseCase;
    private final GetRoleUseCase getRoleUseCase;
    private final GetOneRoleUseCase getOneRoleUseCase;
    private final UpdateRoleUseCase updateRoleUseCase;
    private final DeleteRoleUseCase deleteRoleUseCase;
    private final CreatePermissionToRoleUseCase createPermissionToRoleUseCase;
    private final RemovePermissionUseCase removePermissionUseCase;

    @Inject
    public RoleController(CreateRoleUseCase createRoleUseCase,
                          GetRoleUseCase getRoleUseCase,
                          GetOneRoleUseCase getOneRoleUseCase,
                          UpdateRoleUseCase updateRoleUseCase,
                          DeleteRoleUseCase deleteRoleUseCase,
                          CreatePermissionToRoleUseCase createPermissionToRoleUseCase,
                          RemovePermissionUseCase removePermissionUseCase) {
        this.createRoleUseCase = createRoleUseCase;
        this.getRoleUseCase = getRoleUseCase;
        this.getOneRoleUseCase = getOneRoleUseCase;
        this.updateRoleUseCase = updateRoleUseCase;
        this.deleteRoleUseCase = deleteRoleUseCase;
        this.createPermissionToRoleUseCase = createPermissionToRoleUseCase;
        this.removePermissionUseCase = removePermissionUseCase;
    }

    @Post("/role")
    public Mono<RestResponse<CreateRoleUseCaseResponse>> create(@Body CreateRoleUseCaseRequest request){
        return createRoleUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err-> Mono.just(RestResponse.error("Unexpected on controller" +err.getLocalizedMessage())));
    }

    @Get("/roles")
    public Flux<RestResponse<GetRoleUseCaseResponse>> get(){
        return getRoleUseCase.execute()
                .map(RestResponse::success)
                .onErrorResume(err-> Flux.just(RestResponse.error("Unexpected on controller" +err.getLocalizedMessage())));
    }

    @Get("/role/{id}")
    public Mono<RestResponse<GetRoleUseCaseResponse>> getOne(@PathVariable Integer id){
        var request= new GetOneRoleUseCaseRequest(id);
        return getOneRoleUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err-> Mono.just(RestResponse.error("Unexpected on controller" +err.getLocalizedMessage())));
    }

    @Put("/role")
    public Mono<RestResponse<UpdateRoleUseCaseResponse>> update(@Body UpdateRoleUseCaseRequest request){
        return updateRoleUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err-> Mono.just(RestResponse.error("Unexpected on controller" +err.getLocalizedMessage())));
    }

    @Delete("/role/{id}")
    public Mono<RestResponse<DeleteRoleUseCaseResponse>> delete(@PathVariable Integer id){
        var request= new DeleteRoleUseCaseRequest(id);
        return deleteRoleUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err-> Mono.just(RestResponse.error("Unexpected on controller" +err.getLocalizedMessage())));
    }

    @Post("/{roleId}/permissions")
    public Mono<RestResponse<CreatePermissionToRoleUseCaseResponse>> createPermission(@PathVariable Integer roleId,@Body CreatePermissionToRoleUseCaseRequest request){
        return createPermissionToRoleUseCase.execute(new CreatePermissionToRoleUseCaseRequest(roleId, request.permissionIds()))
                .map(RestResponse::success)
                .onErrorResume(err-> Mono.just(RestResponse.error("Unexpected on controller" +err.getLocalizedMessage())));
    }

    @Delete("/{roleId}/permissions")
    public Mono<RestResponse<RemovePermissionUseCaseResponse>> removePermission(@PathVariable Integer roleId,
                                                                                @Body RemovePermissionUseCaseRequest request){
        return removePermissionUseCase.execute(new RemovePermissionUseCaseRequest(roleId,request.permissionIds()))
                .map(RestResponse::success)
                .onErrorResume(err-> Mono.just(RestResponse.error("Unexpected on controller" +err.getLocalizedMessage())));
    }
}
