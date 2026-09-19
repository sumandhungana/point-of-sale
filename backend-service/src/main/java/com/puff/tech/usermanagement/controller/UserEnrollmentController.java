package com.puff.tech.usermanagement.controller;

import com.puff.tech.core.responses.RestResponse;
import com.puff.tech.usecase.user.add.AddUserUseCaseRequest;
import com.puff.tech.usecase.user.add.AddUserUseCaseResponse;
import com.puff.tech.usermanagement.controller.converter.UserEnrollmentConverter;
import com.puff.tech.usermanagement.controller.payload.UserRegistrationReqPayload;
import com.puff.tech.usermanagement.usecase.UserRegistrationUcResponse;
import com.puff.tech.usermanagement.usecase.UserRegistrationUseCase;
import io.micronaut.http.annotation.Body;
import io.micronaut.http.annotation.Controller;
import io.micronaut.http.annotation.Post;
import jakarta.inject.Inject;
import reactor.core.publisher.Mono;


@Controller("/api/v1")
public class UserEnrollmentController {

    private final UserRegistrationUseCase userRegistrationUseCase;

    @Inject
    UserEnrollmentController(UserRegistrationUseCase userRegistrationUseCases) {
        this.userRegistrationUseCase = userRegistrationUseCases;
    }

    @Post("/register")
    public Mono<RestResponse<UserRegistrationUcResponse>> register(@Body UserRegistrationReqPayload payload) {
        return userRegistrationUseCase.execute(UserEnrollmentConverter.toUcRequest(payload))
                .map(RestResponse::success)
                .onErrorResume(err -> Mono.just(RestResponse.error("Error on Controller:: " + err.getLocalizedMessage())));
    }
}
