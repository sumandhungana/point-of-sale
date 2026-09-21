package com.puff.tech.controller;

import com.puff.tech.core.responses.RestResponse;
import com.puff.tech.onboarding.usecase.user.add.AddUserUseCase;
import com.puff.tech.onboarding.usecase.user.add.AddUserUseCaseRequest;
import com.puff.tech.onboarding.usecase.user.add.AddUserUseCaseResponse;
import com.puff.tech.onboarding.usecase.user.delete.DeleteUserUseCase;
import com.puff.tech.onboarding.usecase.user.delete.DeleteUserUseCaseResponse;
import com.puff.tech.onboarding.usecase.user.get.GetSingleUserUseCase;
import com.puff.tech.onboarding.usecase.user.get.GetUserUseCase;
import com.puff.tech.onboarding.usecase.user.get.GetUserUseCaseResponse;
import com.puff.tech.onboarding.usecase.user.update.UpdateUserUseCase;
import com.puff.tech.onboarding.usecase.user.update.UpdateUserUseCaseRequest;
import com.puff.tech.onboarding.usecase.user.update.UpdateUserUseCaseResponse;
import io.micronaut.http.annotation.*;
import jakarta.inject.Inject;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Controller("/api/v1")
public class UserController {

    private final AddUserUseCase addUserUseCase;
    private final UpdateUserUseCase updateUserUseCase;
    private final DeleteUserUseCase deleteUserUseCase;
    private final GetUserUseCase getUserUseCase;
    private final GetSingleUserUseCase getSingleUserUseCase;

    @Inject
    public UserController(AddUserUseCase addUserUseCase,
                          UpdateUserUseCase updateUserUseCase,
                          DeleteUserUseCase deleteUserUseCase,
                          GetUserUseCase getUserUseCase,
                          GetSingleUserUseCase getSingleUserUseCase){
        this.addUserUseCase=addUserUseCase;
        this.updateUserUseCase = updateUserUseCase;
        this.deleteUserUseCase=deleteUserUseCase;
        this.getUserUseCase=getUserUseCase;
        this.getSingleUserUseCase= getSingleUserUseCase;
    }

    @Post("/user")
    public Mono<RestResponse<AddUserUseCaseResponse>> add(@Body AddUserUseCaseRequest request){
        return addUserUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err-> Mono.just(RestResponse.error("Unexpected on controller" +err.getLocalizedMessage())));
    }

    @Put("/user/{id}")
    public Mono<RestResponse<UpdateUserUseCaseResponse>> update(@PathVariable Integer id,
                                                                @Body UpdateUserUseCaseRequest request){
        return updateUserUseCase.execute(request, id)
                .map(RestResponse::success)
                .onErrorResume(err-> Mono.just(RestResponse.error("Unexpected on controller" +err.getLocalizedMessage())));
    }

    @Delete("/user/{id}")
    public Mono<RestResponse<DeleteUserUseCaseResponse>> delete(@PathVariable Integer id){
        return deleteUserUseCase.execute(id)
                .map(RestResponse::success)
                .onErrorResume(err->Mono.just(RestResponse.error("Operation failed" + err.getLocalizedMessage())));
    }

    @Get("/users")
    public Flux<RestResponse<GetUserUseCaseResponse>> get(){
        return getUserUseCase.execute()
                .map(RestResponse::success)
                .onErrorResume(err->Flux.just(RestResponse.error("Cannot fetch user")));
    }

    @Get("/user/{id}")
    public Mono<RestResponse<GetUserUseCaseResponse>> getOneUser(@PathVariable Integer id){
        return getSingleUserUseCase.execute(id)
                .map(RestResponse::success)
                .onErrorResume(err->Mono.just(RestResponse.error("Cannot fetch user")));
    }

}
