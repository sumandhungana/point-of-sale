package com.puff.tech.onboarding.controller;

import com.puff.tech.core.responses.RestResponse;
import com.puff.tech.customermanagement.usecase.get.GetAllCustomerUseCaseResponse;
import com.puff.tech.customermanagement.usecase.get.GetCustomerUseCaseRequest;
import com.puff.tech.onboarding.usecase.user.get.GetUserUCRequest;
import com.puff.tech.onboarding.usecase.user.get.GetUserUseCase;
import com.puff.tech.onboarding.usecase.user.get.GetUserUseCaseResponse;
import com.puff.tech.onboarding.usecase.userlogin.LoginUserUseCase;
import com.puff.tech.onboarding.usecase.userlogin.LoginUserUseCaseRequest;
import com.puff.tech.onboarding.usecase.userlogin.LoginUserUseCaseResponse;
import com.puff.tech.onboarding.usecase.userlogout.LogoutUserUseCase;
import com.puff.tech.onboarding.usecase.userlogout.LogoutUserUseCaseResponse;
import com.puff.tech.onboarding.controller.converter.UserEnrollmentConverter;
import com.puff.tech.onboarding.controller.payload.UserRegistrationReqPayload;
import com.puff.tech.onboarding.usecase.registration.UserRegistrationUcResponse;
import com.puff.tech.onboarding.usecase.registration.UserRegistrationUseCase;
import com.puff.tech.security.Secured;
import io.micronaut.http.HttpHeaders;
import io.micronaut.http.annotation.*;
import jakarta.inject.Inject;
import reactor.core.publisher.Mono;

import java.util.List;


@Controller("/user")
public class UserEnrollmentController {

    private final UserRegistrationUseCase userRegistrationUseCase;
    private final LoginUserUseCase loginUserUseCase;
    private final LogoutUserUseCase logoutUserUseCase;
    private final GetUserUseCase getUserUseCase;

    @Inject
    UserEnrollmentController(UserRegistrationUseCase userRegistrationUseCases,
                             LoginUserUseCase loginUserUseCase,
                             LogoutUserUseCase logoutUserUseCase, GetUserUseCase getUserUseCase) {
        this.userRegistrationUseCase = userRegistrationUseCases;
        this.loginUserUseCase = loginUserUseCase;
        this.logoutUserUseCase = logoutUserUseCase;
        this.getUserUseCase = getUserUseCase;
    }

    @Post("/register")
    public Mono<RestResponse<UserRegistrationUcResponse>> register(@Body UserRegistrationReqPayload payload) {
        return userRegistrationUseCase.execute(UserEnrollmentConverter.toUcRequest(payload, true, false))
                .map(RestResponse::success)
                .onErrorResume(err -> Mono.just(RestResponse.error("Error on Controller:: " + err.getLocalizedMessage())));
    }

    @Secured(roles = {"Super Admin","ADMIN"}, permissions = {"organization:onboarding"})
    @Post("/onboarding")
    public Mono<RestResponse<UserRegistrationUcResponse>> onboarding(@Body UserRegistrationReqPayload payload) {
        return userRegistrationUseCase.execute(UserEnrollmentConverter.toUcRequest(payload, false, true))
                .map(RestResponse::success)
                .onErrorResume(err -> Mono.just(RestResponse.error("Error on Controller:: " + err.getLocalizedMessage())));
    }

    @Secured(roles = {"Super Admin"}, permissions = {"organization:view"})
    @Get("list")
    public Mono<RestResponse<List<GetUserUseCaseResponse>>> getUsers(){
        return getUserUseCase.execute(new GetUserUCRequest())
                .collectList()
                .map(RestResponse::success)
                .onErrorResume(err->Mono.just(RestResponse.error("Unexpected happened:: " +err.getLocalizedMessage())));
    }

    @Post("login")
    public Mono<RestResponse<LoginUserUseCaseResponse>> login(@Body LoginUserUseCaseRequest request){
        return loginUserUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err-> Mono.just(RestResponse.error("Unexpected happened:: " +err.getLocalizedMessage())));
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
