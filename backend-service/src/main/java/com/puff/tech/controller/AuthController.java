package com.puff.tech.controller;

import com.puff.tech.core.responses.RestResponse;
import com.puff.tech.usermanagement.usecase.userlogin.LoginUserUseCase;
import com.puff.tech.usermanagement.usecase.userlogin.LoginUserUseCaseRequest;
import com.puff.tech.usermanagement.usecase.userlogin.LoginUserUseCaseResponse;
import com.puff.tech.usermanagement.usecase.userlogout.LogoutUserUseCase;
import com.puff.tech.usermanagement.usecase.userlogout.LogoutUserUseCaseResponse;
import io.micronaut.http.HttpHeaders;
import io.micronaut.http.annotation.Body;
import io.micronaut.http.annotation.Controller;
import io.micronaut.http.annotation.Header;
import io.micronaut.http.annotation.Post;
import jakarta.inject.Inject;
import reactor.core.publisher.Mono;

@Controller("/xapi/v1")
public class AuthController {

    private final LoginUserUseCase loginUserUseCase;
    private final  LogoutUserUseCase logoutUserUseCase;

    @Inject
    public AuthController(LoginUserUseCase loginUserUseCase,
                          LogoutUserUseCase logoutUserUseCase){
        this.loginUserUseCase=loginUserUseCase;
        this.logoutUserUseCase= logoutUserUseCase;
    }

    @Post("/user/login")
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
