package com.puff.tech.usermanagement.controller;

import com.puff.tech.core.responses.RestResponse;
import com.puff.tech.security.Secured;
import com.puff.tech.security.UseCaseContext;
import com.puff.tech.usermanagement.enums.Permission;
import com.puff.tech.usermanagement.usecase.role.AddUserRoleUC;
import com.puff.tech.usermanagement.usecase.role.GetUserRoleUc;
import com.puff.tech.usermanagement.usecase.role.UpdateRolePermissionUC;
import com.puff.tech.usermanagement.usecase.role.payload.*;
import io.micronaut.http.annotation.*;
import jakarta.validation.Valid;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Objects;

@Controller("role")
public class RoleController {
    private final AddUserRoleUC addUserRoleUC;
    private final GetUserRoleUc getUserRoleUc;
    private final UpdateRolePermissionUC updateRolePermissionUC;

    public RoleController(
            AddUserRoleUC addUserRoleUC,
            GetUserRoleUc getUserRoleUc, UpdateRolePermissionUC updateRolePermissionUC) {

        this.addUserRoleUC = addUserRoleUC;
        this.getUserRoleUc = getUserRoleUc;
        this.updateRolePermissionUC = updateRolePermissionUC;
    }

    @Secured(permissions = {Permission.ROLE_PERMISSION_CREATE})
    @Post("add")
    public Mono<RestResponse<AddUserRoleUCResponse>> addRole(
            @Valid @Body AddUserRoleUCRequest request
    ) {
        return addUserRoleUC.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err -> Mono.just(RestResponse.error("Unexpected happened:: " + err.getLocalizedMessage())));
    }

    @Secured(permissions = {Permission.ROLE_PERMISSION_FIND_ALL})
    @Get("/list")
    public Mono<RestResponse<List<GetUserRoleUCResponse>>> getRoles() {
        return getUserRoleUc.execute(new GetUserRoleUCRequest())
                .collectList()
                .map(RestResponse::success)
                .onErrorResume(err -> Mono.just(
                        RestResponse.error("Unexpected happened: " + err.getLocalizedMessage())
                ));
    }
    @Secured
    @Put("{id}")
    public Mono<RestResponse<AddUserRoleUCResponse>> updateRole(
            @Valid @Body UpdateRolePermissionUCRequest request, @PathVariable Long id
    ) {
        if(!Objects.equals(id, request.id())) {
           return Mono.just(RestResponse.error("Role Id does not Match Please check."));
        }
        return updateRolePermissionUC.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err -> Mono.just(RestResponse.error("Unexpected happened:: " + err.getLocalizedMessage())));
    }

}
