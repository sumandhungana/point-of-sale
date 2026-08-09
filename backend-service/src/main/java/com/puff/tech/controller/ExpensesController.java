package com.puff.tech.controller;

import com.puff.tech.core.responses.RestResponse;
import com.puff.tech.usecase.expenses.create.CreateExpensesUseCase;
import com.puff.tech.usecase.expenses.create.CreateExpensesUseCaseRequest;
import com.puff.tech.usecase.expenses.create.CreateExpensesUseCaseResponse;
import com.puff.tech.usecase.expenses.delete.DeleteExpensesUseCase;
import com.puff.tech.usecase.expenses.delete.DeleteExpensesUseCaseRequest;
import com.puff.tech.usecase.expenses.delete.DeleteExpensesUseCaseResponse;
import com.puff.tech.usecase.expenses.getall.GetAllExpensesBookUseCase;
import com.puff.tech.usecase.expenses.getall.GetAllExpensesBookUseCaseResponse;
import com.puff.tech.usecase.expenses.getlast.GetLastExpensesUseCase;
import com.puff.tech.usecase.expenses.update.UpdateExpensesUseCase;
import com.puff.tech.usecase.expenses.update.UpdateExpensesUseCaseRequest;
import com.puff.tech.usecase.expenses.update.UpdateExpensesUseCaseResponse;
import io.micronaut.http.MediaType;
import io.micronaut.http.annotation.*;
import io.micronaut.http.multipart.CompletedFileUpload;
import jakarta.inject.Inject;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.time.LocalDate;

@Controller("/api/v1")
public class ExpensesController {

    private final CreateExpensesUseCase createExpensesUseCase;
    private final GetAllExpensesBookUseCase getAllExpensesBookUseCase;
    private final GetLastExpensesUseCase getLastExpensesUseCase;
    private final UpdateExpensesUseCase updateExpensesUseCase;
    private final DeleteExpensesUseCase deleteExpensesUseCase;

    @Inject
    public ExpensesController(CreateExpensesUseCase createExpensesUseCase,
                              GetAllExpensesBookUseCase getAllExpensesBookUseCase,
                              GetLastExpensesUseCase getLastExpensesUseCase,
                              UpdateExpensesUseCase updateExpensesUseCase,
                              DeleteExpensesUseCase deleteExpensesUseCase) {
        this.createExpensesUseCase = createExpensesUseCase;
        this.getAllExpensesBookUseCase = getAllExpensesBookUseCase;
        this.getLastExpensesUseCase = getLastExpensesUseCase;
        this.updateExpensesUseCase=updateExpensesUseCase;
        this.deleteExpensesUseCase= deleteExpensesUseCase;
    }

    @Post(value = "/expenses", consumes = MediaType.MULTIPART_FORM_DATA)
    public Mono<RestResponse<CreateExpensesUseCaseResponse>> create(

            @Part("expensesNo") String expensesNo,
            @Part("date") LocalDate date,
            @Part("categoryId") Integer categoryId,
            @Part("itemId") Integer itemId,
            @Part("paymentMode") String paymentMode,
            @Part("amount") BigDecimal amount,
            @Part(value = "remarks") String remarks,
            @Part(value = "photo") CompletedFileUpload photo
    ) {
        var request= new CreateExpensesUseCaseRequest(

                expensesNo,
                date,
                categoryId,
                itemId,
                paymentMode,
                amount,
                photo,
                remarks

        );
        return createExpensesUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err->Mono.just(RestResponse.error("Unexpected happened" +err.getLocalizedMessage())));
    }

    @Get("/expenses")
    public Flux<RestResponse<GetAllExpensesBookUseCaseResponse>> get(){
        return getAllExpensesBookUseCase.execute()
                .map(RestResponse::success)
                .onErrorResume(err->Mono.just(RestResponse.error("Unexpected happened" +err.getLocalizedMessage())));


    }

    @Get("/expenses/last")
    public Mono<RestResponse<GetAllExpensesBookUseCaseResponse>> getLast(){
        return getLastExpensesUseCase.execute()
                .map(RestResponse::success)
                .onErrorResume(err->Mono.just(RestResponse.error("Unexpected happened" +err.getLocalizedMessage())));

    }
    @Put(value = "/expenses", consumes = MediaType.MULTIPART_FORM_DATA)
    public Mono<RestResponse<UpdateExpensesUseCaseResponse>> update(
            @Part("id") Integer id,
            @Part("expensesNo") String expensesNo,
            @Part("date") LocalDate date,
            @Part("categoryId") Integer categoryId,
            @Part("itemId") Integer itemId,
            @Part("paymentMode") String paymentMode,
            @Part("amount") BigDecimal amount,
            @Part(value = "remarks") String remarks,
            @Part(value = "photo") CompletedFileUpload photo
    ) {
        var request = new UpdateExpensesUseCaseRequest(
                id,
                expensesNo,
                date,
                categoryId,
                itemId,
                paymentMode,
                amount,
                remarks,
                photo
        );

        return updateExpensesUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err->Mono.just(RestResponse.error("Unexpected happened" +err.getLocalizedMessage())));

    }

    @Delete(value = "/expenses/{id}")
    public Mono<RestResponse<DeleteExpensesUseCaseResponse>> delete(@PathVariable Integer id) {
        var request = new DeleteExpensesUseCaseRequest(id);
        return deleteExpensesUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err->Mono.just(RestResponse.error("Unexpected happened" +err.getLocalizedMessage())));

    }
}
