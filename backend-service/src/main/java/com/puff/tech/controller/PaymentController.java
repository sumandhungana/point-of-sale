package com.puff.tech.controller;

import com.puff.tech.core.responses.RestResponse;
import com.puff.tech.usecase.payment.create.CreatePaymentUseCase;
import com.puff.tech.usecase.payment.create.CreatePaymentUseCaseRequest;
import com.puff.tech.usecase.payment.create.CreatePaymentUseCaseResponse;
import com.puff.tech.usecase.payment.delete.DeletePaymentUseCase;
import com.puff.tech.usecase.payment.delete.DeletePaymentUseCaseRequest;
import com.puff.tech.usecase.payment.delete.DeletePaymentUseCaseResponse;
import com.puff.tech.usecase.payment.get.GetPaymentUseCase;
import com.puff.tech.usecase.payment.get.GetPaymentUseCaseResponse;
import com.puff.tech.usecase.payment.getbydate.GetPaymentByDateUseCase;
import com.puff.tech.usecase.payment.getbydate.GetPaymentByDateUseCaseRequest;
import com.puff.tech.usecase.payment.getbydaterange.GetPaymentByDateRangeUseCase;
import com.puff.tech.usecase.payment.getbydaterange.GetPaymentByDateRangeUseCaseRequest;
import com.puff.tech.usecase.payment.getone.GetOnePaymentUseCase;
import com.puff.tech.usecase.payment.getone.GetOnePaymentUseCaseRequest;
import com.puff.tech.usecase.payment.update.UpdatePaymentUseCase;
import com.puff.tech.usecase.payment.update.UpdatePaymentUseCaseRequest;
import com.puff.tech.usecase.payment.update.UpdatePaymentUseCaseResponse;
import io.micronaut.http.annotation.*;
import jakarta.inject.Inject;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDate;

@Controller("/api/v1")
public class PaymentController {

    private final CreatePaymentUseCase createPaymentUseCase;
    private final GetPaymentUseCase getPaymentUseCase;
    private final GetPaymentByDateUseCase getPaymentByDateUseCase;
    private final GetPaymentByDateRangeUseCase getPaymentByDateRangeUseCase;
    private final GetOnePaymentUseCase getOnePaymentUseCase;
    private final UpdatePaymentUseCase updatePaymentUseCase;
    private final DeletePaymentUseCase deletePaymentUseCase;

    @Inject
    public PaymentController(CreatePaymentUseCase createPaymentUseCase,
                             GetPaymentUseCase getPaymentUseCase,
                             GetPaymentByDateUseCase getPaymentByDateUseCase,
                             GetPaymentByDateRangeUseCase getPaymentByDateRangeUseCase,
                             GetOnePaymentUseCase getOnePaymentUseCase,
                             UpdatePaymentUseCase updatePaymentUseCase,
                             DeletePaymentUseCase deletePaymentUseCase) {
        this.createPaymentUseCase = createPaymentUseCase;
        this.getPaymentUseCase = getPaymentUseCase;
        this.getPaymentByDateUseCase = getPaymentByDateUseCase;
        this.getPaymentByDateRangeUseCase = getPaymentByDateRangeUseCase;
        this.getOnePaymentUseCase = getOnePaymentUseCase;
        this.updatePaymentUseCase = updatePaymentUseCase;
        this.deletePaymentUseCase = deletePaymentUseCase;
    }

    @Post("/payment")
    public Mono<RestResponse<CreatePaymentUseCaseResponse>> create(@Body CreatePaymentUseCaseRequest request){
        return createPaymentUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err-> Mono.just(RestResponse.error("Unexpected on controller" +err.getLocalizedMessage())));
    }

    @Get("/payments")
    public Flux<RestResponse<GetPaymentUseCaseResponse>> getAll(){
        return getPaymentUseCase.execute()
                .map(RestResponse::success)
                .onErrorResume(err-> Flux.just(RestResponse.error("Unexpected on controller" +err.getLocalizedMessage())));
    }

    @Get("/payments/{date}")
    public Flux<RestResponse<GetPaymentUseCaseResponse>> getByDate(LocalDate date){
        var request= new GetPaymentByDateUseCaseRequest(date);
        return getPaymentByDateUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err-> Flux.just(RestResponse.error("Unexpected on controller" +err.getLocalizedMessage())));
    }

    @Get("/payments/date")
    public Flux<RestResponse<GetPaymentUseCaseResponse>> getByRange(@Body GetPaymentByDateRangeUseCaseRequest request){
        return getPaymentByDateRangeUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err->Flux.just(RestResponse.error("Unexpected on controller" +err.getLocalizedMessage())));

    }

    @Get("/payment/{id}")
    public Mono<RestResponse<GetPaymentUseCaseResponse>> getOne(@PathVariable Integer id){
        var request= new GetOnePaymentUseCaseRequest(id);
        return getOnePaymentUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err-> Mono.just(RestResponse.error("Unexpected on controller" +err.getLocalizedMessage())));
    }

    @Put("/payment/{id}")
    public Mono<RestResponse<UpdatePaymentUseCaseResponse>> update(@Body UpdatePaymentUseCaseRequest request){
        return updatePaymentUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err-> Mono.just(RestResponse.error("Unexpected on controller" +err.getLocalizedMessage())));
    }

    @Delete("/payment/{id}")
    public Mono<RestResponse<DeletePaymentUseCaseResponse>> delete(@PathVariable Integer id){
        var request = new DeletePaymentUseCaseRequest(id);
        return deletePaymentUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err-> Mono.just(RestResponse.error("Unexpected on controller" +err.getLocalizedMessage())));
    }
}
