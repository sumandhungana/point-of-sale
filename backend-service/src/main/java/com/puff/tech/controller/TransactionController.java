package com.puff.tech.controller;

import com.puff.tech.core.responses.RestResponse;
import com.puff.tech.usecase.transaction.create.CreateTransactionUseCase;
import com.puff.tech.usecase.transaction.create.CreateTransactionUseCaseRequest;
import com.puff.tech.usecase.transaction.create.CreateTransactionUseCaseResponse;
import com.puff.tech.usecase.transaction.delete.DeleteTransactionUseCase;
import com.puff.tech.usecase.transaction.delete.DeleteTransactionUseCaseRequest;
import com.puff.tech.usecase.transaction.delete.DeleteTransactionUseCaseResponse;
import com.puff.tech.usecase.transaction.get.GetTransactionUseCase;
import com.puff.tech.usecase.transaction.get.GetTransactionUseCaseResponse;
import com.puff.tech.usecase.transaction.getone.GetOneTransactionUseCase;
import com.puff.tech.usecase.transaction.getone.GetOneTransactionUseCaseRequest;
import com.puff.tech.usecase.transaction.update.UpdateTransactionUseCase;
import com.puff.tech.usecase.transaction.update.UpdateTransactionUseCaseRequest;
import com.puff.tech.usecase.transaction.update.UpdateTransactionUseCaseResponse;
import io.micronaut.http.annotation.*;
import jakarta.inject.Inject;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Controller("/api/v1")
public class TransactionController {

    private final CreateTransactionUseCase createTransactionUseCase;
    private final GetTransactionUseCase getTransactionUseCase;
    private final GetOneTransactionUseCase getOneTransactionUseCase;
    private final UpdateTransactionUseCase updateTransactionUseCase;
    private final DeleteTransactionUseCase deleteTransactionUseCase;

    @Inject
    public TransactionController(CreateTransactionUseCase createTransactionUseCase,
                                 GetTransactionUseCase getTransactionUseCase,
                                 GetOneTransactionUseCase getOneTransactionUseCase,
                                 UpdateTransactionUseCase updateTransactionUseCase,
                                 DeleteTransactionUseCase deleteTransactionUseCase) {
        this.createTransactionUseCase = createTransactionUseCase;
        this.getTransactionUseCase = getTransactionUseCase;
        this.getOneTransactionUseCase = getOneTransactionUseCase;
        this.updateTransactionUseCase = updateTransactionUseCase;
        this.deleteTransactionUseCase = deleteTransactionUseCase;
    }

    @Post("/transaction")
    public Mono<RestResponse<CreateTransactionUseCaseResponse>> create(@Body CreateTransactionUseCaseRequest request){
        return createTransactionUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err->Mono.just(RestResponse.error("Unexpected happened" +err.getLocalizedMessage())));
    }

    @Get("/transactions")
    public Flux<RestResponse<GetTransactionUseCaseResponse>> get(){
        return getTransactionUseCase.execute()
                .map(RestResponse::success)
                .onErrorResume(err->Flux.just(RestResponse.error("Unexpected happened" +err.getLocalizedMessage())));
    }

    @Get("/transaction/{id}")
    public Mono<RestResponse<GetTransactionUseCaseResponse>> getOne(@PathVariable Integer id){
        var request= new GetOneTransactionUseCaseRequest(id);
        return getOneTransactionUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err->Mono.just(RestResponse.error("Unexpected happened" +err.getLocalizedMessage())));
    }

    @Put("/transaction/{id}")
    public Mono<RestResponse<UpdateTransactionUseCaseResponse>> update(@Body UpdateTransactionUseCaseRequest request){
        return updateTransactionUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err->Mono.just(RestResponse.error("Unexpected happened" +err.getLocalizedMessage())));
    }

    @Delete("/transaction/{id}")
    public Mono<RestResponse<DeleteTransactionUseCaseResponse>> delete(@PathVariable Integer id){
        var request= new DeleteTransactionUseCaseRequest(id);
        return deleteTransactionUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err->Mono.just(RestResponse.error("Unexpected happened" +err.getLocalizedMessage())));
    }
}
