package com.puff.tech.onboarding.controller;

import com.puff.tech.core.responses.RestResponse;
import com.puff.tech.onboarding.controller.converter.UserEnrollmentConverter;
import com.puff.tech.onboarding.controller.payload.UserRegistrationReqPayload;
import com.puff.tech.onboarding.usecase.flush.FlushTokenUC;
import com.puff.tech.onboarding.usecase.flush.FlushTokenUCRequest;
import com.puff.tech.onboarding.usecase.onbaording.OwnMemberOnboardingUC;
import com.puff.tech.onboarding.usecase.onbaording.OwnMemberOnboardingUCRequest;
import com.puff.tech.onboarding.usecase.onbaording.OwnMemberOnboardingUCResponse;
import com.puff.tech.onboarding.usecase.registration.UserRegistrationUcResponse;
import com.puff.tech.onboarding.usecase.registration.UserRegistrationUseCase;
import com.puff.tech.onboarding.usecase.user.get.GetUserUCRequest;
import com.puff.tech.onboarding.usecase.user.get.GetUserUseCase;
import com.puff.tech.onboarding.usecase.user.get.GetUserUseCaseResponse;
import com.puff.tech.onboarding.usecase.userlogin.LoginUserUseCase;
import com.puff.tech.onboarding.usecase.userlogin.LoginUserUseCaseRequest;
import com.puff.tech.onboarding.usecase.userlogin.LoginUserUseCaseResponse;
import com.puff.tech.onboarding.usecase.userlogout.LogoutUserUseCase;
import com.puff.tech.onboarding.usecase.userlogout.LogoutUserUseCaseRequest;
import com.puff.tech.onboarding.usecase.userlogout.LogoutUserUseCaseResponse;
import com.puff.tech.security.Secured;
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
    private final FlushTokenUC flushTokenUC;
    private final OwnMemberOnboardingUC ownMemberOnboardingUC;

    @Inject
    UserEnrollmentController(UserRegistrationUseCase userRegistrationUseCases,
                             LoginUserUseCase loginUserUseCase,
                             LogoutUserUseCase logoutUserUseCase,
                             GetUserUseCase getUserUseCase,
                             FlushTokenUC flushTokenUC, OwnMemberOnboardingUC ownMemberOnboardingUC) {
        this.userRegistrationUseCase = userRegistrationUseCases;
        this.loginUserUseCase = loginUserUseCase;
        this.logoutUserUseCase = logoutUserUseCase;
        this.getUserUseCase = getUserUseCase;
        this.flushTokenUC = flushTokenUC;
        this.ownMemberOnboardingUC = ownMemberOnboardingUC;
    }

    @Post("/register")
    public Mono<RestResponse<UserRegistrationUcResponse>> register(@Body UserRegistrationReqPayload payload) {
        return userRegistrationUseCase.execute(UserEnrollmentConverter.toUcRequest(payload, true))
                .map(RestResponse::success)
                .onErrorResume(err -> Mono.just(RestResponse.error("Error on Controller:: " + err.getLocalizedMessage())));
    }

    @Secured(roles = {"Super Admin", "ADMIN"})
    @Post("/member-onboarding")
    public Mono<RestResponse<OwnMemberOnboardingUCResponse>> onboarding(@Body OwnMemberOnboardingUCRequest payload) {
        return ownMemberOnboardingUC.execute(payload)
                .map(RestResponse::success)
                .onErrorResume(err -> Mono.just(RestResponse.error("Error on Controller:: " + err.getLocalizedMessage())));
    }

    @Secured(roles = {"Super Admin"}, permissions = {"organization:view"})
    @Get("list")
    public Mono<RestResponse<List<GetUserUseCaseResponse>>> getUsers() {
        return getUserUseCase.execute(new GetUserUCRequest())
                .collectList()
                .map(RestResponse::success)
                .onErrorResume(err -> Mono.just(RestResponse.error("Unexpected happened:: " + err.getLocalizedMessage())));
    }

    @Post("login")
    public Mono<RestResponse<LoginUserUseCaseResponse>> login(@Body LoginUserUseCaseRequest request) {
        return loginUserUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err -> Mono.just(RestResponse.error("Unexpected happened:: " + err.getLocalizedMessage())));
    }

    @Secured
    @Post("/logout")
    public Mono<RestResponse<LogoutUserUseCaseResponse>> logout() {
        return logoutUserUseCase.execute(new LogoutUserUseCaseRequest())
                .map(RestResponse::success)
                .onErrorResume(err -> Mono.just(RestResponse.error("Unexpected happened:: " + err.getLocalizedMessage())));
    }


    @Secured(roles = {"ADMIN", "Super Admin"})
    @Get("flush-token/{id}")
    public Mono<RestResponse<LoginUserUseCaseResponse>> flushToken(@PathVariable Long id) {
        return flushTokenUC.execute(new FlushTokenUCRequest(id))
                .map(RestResponse::success)
                .onErrorResume(err -> Mono.just(RestResponse.error("Unexpected happened:: " + err.getLocalizedMessage())));
    }
}
