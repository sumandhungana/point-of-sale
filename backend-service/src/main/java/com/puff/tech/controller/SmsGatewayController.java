package com.puff.tech.controller;

import com.puff.tech.core.responses.RestResponse;
import com.puff.tech.usecase.smsgateway.create.CreateSmsGatewayUseCase;
import com.puff.tech.usecase.smsgateway.create.CreateSmsGatewayUseCaseRequest;
import com.puff.tech.usecase.smsgateway.create.CreateSmsGatewayUseCaseResponse;
import com.puff.tech.usecase.smsgateway.delete.DeleteSmsGatewayUseCase;
import com.puff.tech.usecase.smsgateway.delete.DeleteSmsGatewayUseCaseRequest;
import com.puff.tech.usecase.smsgateway.delete.DeleteSmsGatewayUseCaseResponse;
import com.puff.tech.usecase.smsgateway.get.GetSmsGatewayUseCase;
import com.puff.tech.usecase.smsgateway.get.GetSmsGatewayUseCaseResponse;
import com.puff.tech.usecase.smsgateway.getone.GetOneSmsUseCase;
import com.puff.tech.usecase.smsgateway.getone.GetOneSmsUseCaseRequest;
import com.puff.tech.usecase.smsgateway.update.UpdateSmsGatewayUseCase;
import com.puff.tech.usecase.smsgateway.update.UpdateSmsGatewayUseCaseRequest;
import com.puff.tech.usecase.smsgateway.update.UpdateSmsGatewayUseCaseResponse;
import com.puff.tech.usecase.user.add.AddUserUseCaseRequest;
import com.puff.tech.usecase.user.add.AddUserUseCaseResponse;
import com.puff.tech.usecase.user.delete.DeleteUserUseCaseResponse;
import com.puff.tech.usecase.user.get.GetUserUseCaseResponse;
import com.puff.tech.usecase.user.update.UpdateUserUseCaseRequest;
import com.puff.tech.usecase.user.update.UpdateUserUseCaseResponse;
import io.micronaut.http.annotation.*;
import jakarta.inject.Inject;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Controller("/api/v1")
public class SmsGatewayController {

    private final CreateSmsGatewayUseCase smsGatewayUseCase;
    private final GetSmsGatewayUseCase getSmsGatewayUseCase;
    private final GetOneSmsUseCase getOneSmsUseCase;
    private final UpdateSmsGatewayUseCase updateSmsGatewayUseCase;
    private final DeleteSmsGatewayUseCase deleteSmsGatewayUseCase;

    @Inject
    public SmsGatewayController(CreateSmsGatewayUseCase smsGatewayUseCase,
                                GetSmsGatewayUseCase getSmsGatewayUseCase,
                                GetOneSmsUseCase getOneSmsUseCase,
                                UpdateSmsGatewayUseCase updateSmsGatewayUseCase,
                                DeleteSmsGatewayUseCase deleteSmsGatewayUseCase) {
        this.smsGatewayUseCase = smsGatewayUseCase;
        this.getSmsGatewayUseCase = getSmsGatewayUseCase;
        this.getOneSmsUseCase = getOneSmsUseCase;
        this.updateSmsGatewayUseCase = updateSmsGatewayUseCase;
        this.deleteSmsGatewayUseCase = deleteSmsGatewayUseCase;
    }


    @Post("/smsgateway")
    public Mono<RestResponse<CreateSmsGatewayUseCaseResponse>> add(@Body CreateSmsGatewayUseCaseRequest request){
        return smsGatewayUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err-> Mono.just(RestResponse.error("Unexpected on controller" +err.getLocalizedMessage())));
    }

    @Put("/smsgateway")
    public Mono<RestResponse<UpdateSmsGatewayUseCaseResponse>> update(@Body UpdateSmsGatewayUseCaseRequest request){
        return updateSmsGatewayUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err-> Mono.just(RestResponse.error("Unexpected on controller" +err.getLocalizedMessage())));
    }

    @Delete("/smsgateway/{id}")
    public Mono<RestResponse<DeleteSmsGatewayUseCaseResponse>> delete(@PathVariable Integer id){
        var request= new DeleteSmsGatewayUseCaseRequest(id);
        return deleteSmsGatewayUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err->Mono.just(RestResponse.error("Operation failed" + err.getLocalizedMessage())));
    }

    @Get("/smsgateway")
    public Flux<RestResponse<GetSmsGatewayUseCaseResponse>> get(){
        return getSmsGatewayUseCase.execute()
                .map(RestResponse::success)
                .onErrorResume(err->Flux.just(RestResponse.error("Unexpected happened" +err.getLocalizedMessage())));
    }

    @Get("/smsgatewy/{id}")
    public Mono<RestResponse<GetSmsGatewayUseCaseResponse>> getOneUser(@PathVariable Integer id){
        var request= new GetOneSmsUseCaseRequest(id);
        return getOneSmsUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err->Mono.just(RestResponse.error("Unexpected happened" +err.getLocalizedMessage())));
    }
}
