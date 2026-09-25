package com.puff.tech.onboarding.controller;

import com.puff.tech.core.responses.RestResponse;
import com.puff.tech.onboarding.usecase.userlogin.LoginUserUseCase;
import com.puff.tech.onboarding.usecase.userlogin.LoginUserUseCaseRequest;
import com.puff.tech.onboarding.usecase.userlogin.LoginUserUseCaseResponse;
import com.puff.tech.onboarding.usecase.userlogout.LogoutUserUseCase;
import com.puff.tech.onboarding.usecase.userlogout.LogoutUserUseCaseResponse;
import com.puff.tech.onboarding.controller.converter.UserEnrollmentConverter;
import com.puff.tech.onboarding.controller.payload.UserRegistrationReqPayload;
import com.puff.tech.onboarding.usecase.registration.UserRegistrationUcResponse;
import com.puff.tech.onboarding.usecase.registration.UserRegistrationUseCase;
import io.micronaut.http.HttpHeaders;
import io.micronaut.http.annotation.Body;
import io.micronaut.http.annotation.Controller;
import io.micronaut.http.annotation.Header;
import io.micronaut.http.annotation.Post;
import jakarta.inject.Inject;
import reactor.core.publisher.Mono;


@Controller("/user")
public class UserEnrollmentController {

    private final UserRegistrationUseCase userRegistrationUseCase;
    private final LoginUserUseCase loginUserUseCase;
    private final LogoutUserUseCase logoutUserUseCase;

    @Inject
    UserEnrollmentController(UserRegistrationUseCase userRegistrationUseCases,
                             LoginUserUseCase loginUserUseCase,
                             LogoutUserUseCase logoutUserUseCase) {
        this.userRegistrationUseCase = userRegistrationUseCases;
        this.loginUserUseCase = loginUserUseCase;
        this.logoutUserUseCase = logoutUserUseCase;
    }

    @Post("/register")
    public Mono<RestResponse<UserRegistrationUcResponse>> register(@Body UserRegistrationReqPayload payload) {
        return userRegistrationUseCase.execute(UserEnrollmentConverter.toUcRequest(payload, true))
                .map(RestResponse::success)
                .onErrorResume(err -> Mono.just(RestResponse.error("Error on Controller:: " + err.getLocalizedMessage())));
    }

    @Post("login")
    public Mono<RestResponse<LoginUserUseCaseResponse>> login(@Body LoginUserUseCaseRequest request){
        return loginUserUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err-> Mono.just(RestResponse.error("Unexpected happened" +err.getLocalizedMessage())));
    }

    @Post("/logout")
    public Mono<RestResponse<LogoutUserUseCaseResponse>> logout(@Header(HttpHeaders.AUTHORIZATION)
                                                                String authorization){
        return Mono.justOrEmpty(authorization)
                .switchIfEmpty(Mono.error(new Throwable("Unauthorized")))
                .flatMap(logoutUserUseCase::execute)
                .map(RestResponse::success)
                .onErrorResume(err-> Mono.just(RestResponse.error("Unexpected happened" +err.getLocalizedMessage())));
    }
}
