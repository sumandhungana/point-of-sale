package com.puff.tech.controller;

import com.puff.tech.core.responses.RestResponse;
import com.puff.tech.usecase.paymentgateway.create.CreatePaymentGatewayUseCase;
import com.puff.tech.usecase.paymentgateway.create.CreatePaymentGatewayUseCaseRequest;
import com.puff.tech.usecase.paymentgateway.create.CreatePaymentGatewayUseCaseResponse;
import com.puff.tech.usecase.paymentgateway.delete.DeletePaymentGatewayUseCase;
import com.puff.tech.usecase.paymentgateway.delete.DeletePaymentGatewayUseCaseRequest;
import com.puff.tech.usecase.paymentgateway.delete.DeletePaymentGatewayUseCaseResponse;
import com.puff.tech.usecase.paymentgateway.get.GetPaymentGatewayUseCase;
import com.puff.tech.usecase.paymentgateway.get.GetPaymentGatewayUseCaseResponse;
import com.puff.tech.usecase.paymentgateway.getOne.GetOnePaymentGatewayUseCase;
import com.puff.tech.usecase.paymentgateway.getOne.GetOnePaymentGatewayUseCaseRequest;
import com.puff.tech.usecase.paymentgateway.update.UpdatePaymentGatewayUseCase;
import com.puff.tech.usecase.paymentgateway.update.UpdatePaymentGatewayUseCaseRequest;
import com.puff.tech.usecase.paymentgateway.update.UpdatePaymentGatewayUseCaseResponse;
import io.micronaut.http.annotation.*;
import jakarta.inject.Inject;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Controller("/api/v1")
public class PaymentGatewayController {

    private final CreatePaymentGatewayUseCase createPaymentGatewayUseCase;
    private final GetPaymentGatewayUseCase getPaymentGatewayUseCase;
    private final GetOnePaymentGatewayUseCase getOnePaymentGatewayUseCase;
    private final UpdatePaymentGatewayUseCase updatePaymentGatewayUseCase;
    private final DeletePaymentGatewayUseCase deletePaymentGatewayUseCase;

    @Inject
    public PaymentGatewayController(CreatePaymentGatewayUseCase createPaymentGatewayUseCase,
                                    GetPaymentGatewayUseCase getPaymentGatewayUseCase,
                                    GetOnePaymentGatewayUseCase getOnePaymentGatewayUseCase,
                                    UpdatePaymentGatewayUseCase updatePaymentGatewayUseCase,
                                    DeletePaymentGatewayUseCase deletePaymentGatewayUseCase) {
        this.createPaymentGatewayUseCase = createPaymentGatewayUseCase;
        this.getPaymentGatewayUseCase = getPaymentGatewayUseCase;
        this.getOnePaymentGatewayUseCase = getOnePaymentGatewayUseCase;
        this.updatePaymentGatewayUseCase = updatePaymentGatewayUseCase;
        this.deletePaymentGatewayUseCase = deletePaymentGatewayUseCase;
    }

    @Post("/payment-gateway")
    public Mono<RestResponse<CreatePaymentGatewayUseCaseResponse>> create(@Body CreatePaymentGatewayUseCaseRequest request){
        return  createPaymentGatewayUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err-> Mono.just(RestResponse.error("Unexpected on controller" +err.getLocalizedMessage())));
    }

    @Get("/payment-gateways")
    public Flux<RestResponse<GetPaymentGatewayUseCaseResponse>> get(){
        return getPaymentGatewayUseCase.execute()
                .map(RestResponse::success)
                .onErrorResume(err-> Flux.just(RestResponse.error("Unexpected on controller" +err.getLocalizedMessage())));
    }

    @Get("/payment-gateway/{id}")
    public Mono<RestResponse<GetPaymentGatewayUseCaseResponse>> getOne(@PathVariable Integer id){
        var request= new GetOnePaymentGatewayUseCaseRequest(id);
        return getOnePaymentGatewayUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err-> Mono.just(RestResponse.error("Unexpected on controller" +err.getLocalizedMessage())));
    }

    @Put("/payment-gateway")
    public Mono<RestResponse<UpdatePaymentGatewayUseCaseResponse>> update(@Body UpdatePaymentGatewayUseCaseRequest request){
        return updatePaymentGatewayUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err-> Mono.just(RestResponse.error("Unexpected on controller" +err.getLocalizedMessage())));
    }

    @Delete("//payment-gateway/{id}")
    public Mono<RestResponse<DeletePaymentGatewayUseCaseResponse>> delete(@PathVariable Integer id){
        var request= new DeletePaymentGatewayUseCaseRequest(id);
        return deletePaymentGatewayUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err-> Mono.just(RestResponse.error("Unexpected on controller" +err.getLocalizedMessage())));
    }
}
