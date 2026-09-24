package com.puff.tech.usermanagement.controller;

import com.puff.tech.core.responses.RestResponse;
import com.puff.tech.security.Secured;
import com.puff.tech.usermanagement.usecase.permissions.GetPermissionsUC;
import com.puff.tech.usermanagement.usecase.permissions.payload.GetPermissionsUCRequest;
import com.puff.tech.usermanagement.usecase.permissions.payload.GetPermissionsUCResponse;
import io.micronaut.http.annotation.Controller;
import io.micronaut.http.annotation.Get;
import reactor.core.publisher.Mono;

import java.util.List;

@Controller("permission")
public class PermissionController {

    private final GetPermissionsUC getPermissionsUC;

    public PermissionController(GetPermissionsUC getPermissionsUC) {
        this.getPermissionsUC = getPermissionsUC;
    }

    @Secured
    @Get("/list")
    public Mono<RestResponse<List<GetPermissionsUCResponse>>> getPermissions() {
        return getPermissionsUC.execute(new GetPermissionsUCRequest())
                .collectList()
                .map(RestResponse::success)
                .onErrorResume(err->Mono.just(RestResponse.error("Unexpected happened:: " +err.getLocalizedMessage())));
    }
}
