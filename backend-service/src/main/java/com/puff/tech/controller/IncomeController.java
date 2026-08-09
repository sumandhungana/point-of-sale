package com.puff.tech.controller;

import com.puff.tech.core.responses.RestResponse;
import com.puff.tech.usecase.income.create.CreateIncomeUseCase;
import com.puff.tech.usecase.income.create.CreateIncomeUseCaseRequest;
import com.puff.tech.usecase.income.create.CreateIncomeUseCaseResponse;
import com.puff.tech.usecase.income.delete.DeleteIncomeUseCase;
import com.puff.tech.usecase.income.delete.DeleteIncomeUseCaseRequest;
import com.puff.tech.usecase.income.delete.DeleteIncomeUseCaseResponse;
import com.puff.tech.usecase.income.get.GetAllIncomeUseCase;
import com.puff.tech.usecase.income.get.GetIncomeUseCaseResponse;
import com.puff.tech.usecase.income.getfirst.GetFirstIncomeUseCase;
import com.puff.tech.usecase.income.getone.GetOneIncomeUseCase;
import com.puff.tech.usecase.income.getone.GetOneIncomeUseCaseRequest;
import com.puff.tech.usecase.income.update.UpdateIncomeUseCase;
import com.puff.tech.usecase.income.update.UpdateIncomeUseCaseRequest;
import com.puff.tech.usecase.income.update.UpdateIncomeUseCaseResponse;
import io.micronaut.http.MediaType;
import io.micronaut.http.annotation.*;
import io.micronaut.http.multipart.CompletedFileUpload;
import jakarta.inject.Inject;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.time.LocalDate;

@Controller("api/v1")
public class IncomeController {

    private final CreateIncomeUseCase createIncomeUseCase;
    private final GetAllIncomeUseCase getAllIncomeUseCase;
    private final GetFirstIncomeUseCase getFirstIncomeUseCase;
    private final GetOneIncomeUseCase getOneIncomeUseCase;
    private final UpdateIncomeUseCase updateIncomeUseCase;
    private final DeleteIncomeUseCase deleteIncomeUseCase;

    @Inject
    public IncomeController(CreateIncomeUseCase createIncomeUseCase,
                            GetAllIncomeUseCase getAllIncomeUseCase,
                            GetFirstIncomeUseCase getFirstIncomeUseCase,
                            GetOneIncomeUseCase getOneIncomeUseCase,
                            UpdateIncomeUseCase updateIncomeUseCase,
                            DeleteIncomeUseCase deleteIncomeUseCase) {
        this.createIncomeUseCase = createIncomeUseCase;
        this.getAllIncomeUseCase = getAllIncomeUseCase;
        this.getFirstIncomeUseCase = getFirstIncomeUseCase;
        this.getOneIncomeUseCase = getOneIncomeUseCase;
        this.updateIncomeUseCase = updateIncomeUseCase;
        this.deleteIncomeUseCase = deleteIncomeUseCase;
    }

    @Post(value = "/income", consumes = MediaType.MULTIPART_FORM_DATA)
    public Mono<RestResponse<CreateIncomeUseCaseResponse>> create(
           @Part("incomeNo") String incomeNo,
           @Part("date") LocalDate date,
           @Part("categoryId") Integer categoryId,
           @Part("itemId") Integer itemId,
           @Part("paymentMode") String paymentMode,
           @Part("amount") BigDecimal amount,
           @Part("remarks") String remarks,
           @Part("photo") CompletedFileUpload photo
    ) {
        var request= new CreateIncomeUseCaseRequest(
                incomeNo,
                date,
                categoryId,
                itemId,
                paymentMode,
                amount,
                remarks,
                photo
        );
        return createIncomeUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err->Mono.just(RestResponse.error("Unexpected happened"+err.getLocalizedMessage())));

    }

    @Get("/incomes")
    public Flux<RestResponse<GetIncomeUseCaseResponse>> get(){
        return getAllIncomeUseCase.execute()
                .map(RestResponse::success)
                .onErrorResume(err->Flux.just(RestResponse.error("Unexpected happened"+err.getLocalizedMessage())));


    }
    @Get("income/last")
    public Mono<RestResponse<GetIncomeUseCaseResponse>> getLast(){
        return getFirstIncomeUseCase.execute()
                .map(RestResponse::success)
                .onErrorResume(err->Mono.just(RestResponse.error("Unexpected happened"+err.getLocalizedMessage())));
    }

    @Get("/income/{id}")
    public Mono<RestResponse<GetIncomeUseCaseResponse>> getOne(@PathVariable Integer id){
        var request = new GetOneIncomeUseCaseRequest(id);
        return getOneIncomeUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err->Mono.just(RestResponse.error("Unexpected happened"+err.getLocalizedMessage())));

    }

    @Put(value = "/income", consumes = MediaType.MULTIPART_FORM_DATA)
    public Mono<RestResponse<UpdateIncomeUseCaseResponse>> update(
            @Part("id") Integer id,
            @Part("incomeNo") String incomeNo,
            @Part("date") LocalDate date,
            @Part("categoryId") Integer categoryId,
            @Part("itemId") Integer itemId,
            @Part("paymentMode") String paymentMode,
            @Part("amount") BigDecimal amount,
            @Part("remarks") String remarks,
            @Part("photo") CompletedFileUpload photo
    ) {
        var request= new UpdateIncomeUseCaseRequest(
                id,
                incomeNo,
                date,
                categoryId,
                itemId,
                paymentMode,
                amount,
                remarks,
                photo
        );
        return updateIncomeUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err->Mono.just(RestResponse.error("Unexpected happened"+err.getLocalizedMessage())));

    }

    @Delete("/income/{id}")
    public Mono<RestResponse<DeleteIncomeUseCaseResponse>> delete(@PathVariable Integer id){
        var request = new DeleteIncomeUseCaseRequest(id);
        return deleteIncomeUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err->Mono.just(RestResponse.error("Unexpected happened"+err.getLocalizedMessage())));

    }

}
