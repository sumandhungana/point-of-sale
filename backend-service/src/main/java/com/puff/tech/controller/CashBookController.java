package com.puff.tech.controller;

import com.puff.tech.core.responses.RestResponse;
import com.puff.tech.usecase.cashbook.create.CreateCashBookUseCase;
import com.puff.tech.usecase.cashbook.create.CreateCashBookUseCaseRequest;
import com.puff.tech.usecase.cashbook.create.CreateCashBookUseCaseResponse;
import com.puff.tech.usecase.cashbook.update.UpdateCashBookUseCase;
import com.puff.tech.usecase.cashbook.update.UpdateCashBookUseCaseRequest;
import com.puff.tech.usecase.cashbook.update.UpdateCashBookUseCaseResponse;
import com.puff.tech.usecase.cashbook.delete.DeleteCashBookUseCase;
import com.puff.tech.usecase.cashbook.delete.DeleteCashBookUseCaseResponse;

import io.micronaut.http.MediaType;
import io.micronaut.http.annotation.*;
import io.micronaut.http.multipart.CompletedFileUpload;
import jakarta.inject.Inject;
import reactor.core.publisher.Mono;

import java.io.IOException;

@Controller("/api/v1")
public class CashBookController {

    private final CreateCashBookUseCase createUseCase;
    private final UpdateCashBookUseCase updateUseCase;
    private final DeleteCashBookUseCase deleteUseCase;

    @Inject
    public CashBookController(CreateCashBookUseCase createUseCase,
                              UpdateCashBookUseCase updateUseCase,
                              DeleteCashBookUseCase deleteUseCase) {
        this.createUseCase = createUseCase;
        this.updateUseCase = updateUseCase;
        this.deleteUseCase = deleteUseCase;
    }


    @Post( value = "/cashbook", consumes = MediaType.MULTIPART_FORM_DATA)
    public Mono<RestResponse<CreateCashBookUseCaseResponse>> create(
            @Part String cashbookNo,
            @Part String date,
            @Part Integer categoryId,
            @Part Integer itemId,
            @Part String paymentMode,
            @Part Double amount,
            @Part(value = "remarks") String remarks,
            @Part(value = "photo") CompletedFileUpload photo
    ) throws IOException {

        CreateCashBookUseCaseRequest request =
                new CreateCashBookUseCaseRequest(
                        cashbookNo,
                        java.time.LocalDate.parse(date),
                        categoryId,
                        itemId,
                        paymentMode,
                        java.math.BigDecimal.valueOf(amount),
                        remarks,
                        photo
                );

        return createUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err->Mono.just(RestResponse.error("Unexpected happened" +err.getLocalizedMessage())))
                ;
    }


    @Put(value = "/cashbook/{id}", consumes = MediaType.MULTIPART_FORM_DATA)
    public Mono<RestResponse<UpdateCashBookUseCaseResponse>> update(
            @PathVariable Integer id,
            @Part String cashbookNo,
            @Part String date,
            @Part Long categoryId,
            @Part Long itemId,
            @Part String paymentMode,
            @Part Double amount,
            @Part(value = "remarks" ) String remarks,
            @Part(value = "photo") CompletedFileUpload photo
    ) {

        UpdateCashBookUseCaseRequest request =
                new UpdateCashBookUseCaseRequest(
                        cashbookNo,
                        java.time.LocalDate.parse(date),
                        categoryId,
                        itemId,
                        paymentMode,
                        java.math.BigDecimal.valueOf(amount),
                        remarks,
                        photo
                );

        return updateUseCase.execute(id, request)
                .map(RestResponse::success)
                .onErrorResume(err->Mono.just(RestResponse.error("Unexpected happened" +err.getLocalizedMessage())))
                ;
    }


    @Delete("/cashbook/{id}")
    public Mono<RestResponse<DeleteCashBookUseCaseResponse>> delete( @PathVariable  Integer id) {
        return deleteUseCase.execute(id)
                .map(RestResponse::success)
                .onErrorResume(err->Mono.just(RestResponse.error("Unexpected happened" +err.getLocalizedMessage())));
    }
}