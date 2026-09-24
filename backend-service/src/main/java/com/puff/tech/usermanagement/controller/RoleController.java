package com.puff.tech.usermanagement.controller;

import com.puff.tech.core.responses.RestResponse;
import com.puff.tech.security.Secured;
import com.puff.tech.security.UseCaseContext;
import com.puff.tech.usermanagement.usecase.role.AddUserRoleUC;
import com.puff.tech.usermanagement.usecase.role.GetUserRoleUc;
import com.puff.tech.usermanagement.usecase.role.payload.AddUserRoleUCRequest;
import com.puff.tech.usermanagement.usecase.role.payload.AddUserRoleUCResponse;
import com.puff.tech.usermanagement.usecase.role.payload.GetUserRoleUCRequest;
import com.puff.tech.usermanagement.usecase.role.payload.GetUserRoleUCResponse;
import io.micronaut.http.annotation.Body;
import io.micronaut.http.annotation.Controller;
import io.micronaut.http.annotation.Get;
import io.micronaut.http.annotation.Post;
import jakarta.validation.Valid;
import reactor.core.publisher.Mono;

import java.util.List;

@Controller("role")
public class RoleController {
    private final AddUserRoleUC addUserRoleUC;
    private final GetUserRoleUc getUserRoleUc;

    public RoleController(
            AddUserRoleUC addUserRoleUC,
            GetUserRoleUc getUserRoleUc) {

        this.addUserRoleUC = addUserRoleUC;
        this.getUserRoleUc = getUserRoleUc;
    }

    @Secured
    @Post("add")
    public Mono<RestResponse<AddUserRoleUCResponse>> addRole(
            @Valid @Body AddUserRoleUCRequest request
    ) {
        return addUserRoleUC.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err -> Mono.just(RestResponse.error("Unexpected happened:: " + err.getLocalizedMessage())));
    }

    @Secured
    @Get("/list")
    public Mono<RestResponse<List<GetUserRoleUCResponse>>> getRoles() {
        return getUserRoleUc.execute(new GetUserRoleUCRequest())
                .collectList()
                .map(RestResponse::success)
                .onErrorResume(err -> Mono.just(
                        RestResponse.error("Unexpected happened: " + err.getLocalizedMessage())
                ));
    }

}
