package com.puff.tech.controller;

import com.puff.tech.core.responses.RestResponse;
import com.puff.tech.usecase.purchase.create.CreatePurchaseUseCase;
import com.puff.tech.usecase.purchase.create.CreatePurchaseUseCaseRequest;
import com.puff.tech.usecase.purchase.create.CreatePurchaseUseCaseResponse;
import com.puff.tech.usecase.purchase.delete.DeletePurchaseUseCase;
import com.puff.tech.usecase.purchase.delete.DeletePurchaseUseCaseRequest;
import com.puff.tech.usecase.purchase.delete.DeletePurchaseUseCaseResponse;
import com.puff.tech.usecase.purchase.get.GetPurchaseUseCase;
import com.puff.tech.usecase.purchase.get.GetPurchaseUseCaseResponse;
import com.puff.tech.usecase.purchase.getlast.GetLastPurchaseUseCase;
import com.puff.tech.usecase.purchase.getone.GetOnePurchaseUseCase;
import com.puff.tech.usecase.purchase.getone.GetOnePurchaseUseCaseRequest;
import com.puff.tech.usecase.purchase.update.UpdatePurchaseUseCase;
import com.puff.tech.usecase.purchase.update.UpdatePurchaseUseCaseRequest;
import com.puff.tech.usecase.purchase.update.UpdatePurchaseUseCaseResponse;
import io.micronaut.http.MediaType;
import io.micronaut.http.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.time.LocalDate;

@Controller("/api/v1")
public class PurchaseController {

    private final CreatePurchaseUseCase createPurchaseUseCase;
    private final GetPurchaseUseCase getPurchaseUseCase;
    private final GetOnePurchaseUseCase getOnePurchaseUseCase;
    private final GetLastPurchaseUseCase getLastPurchaseUseCase;
    private final UpdatePurchaseUseCase updatePurchaseUseCase;
    private final DeletePurchaseUseCase deletePurchaseUseCase;

    public PurchaseController(CreatePurchaseUseCase createPurchaseUseCase,
                              GetPurchaseUseCase getPurchaseUseCase,
                              GetOnePurchaseUseCase getOnePurchaseUseCase,
                              GetLastPurchaseUseCase getLastPurchaseUseCase,
                              UpdatePurchaseUseCase updatePurchaseUseCase,
                              DeletePurchaseUseCase deletePurchaseUseCase) {
        this.createPurchaseUseCase = createPurchaseUseCase;
        this.getPurchaseUseCase = getPurchaseUseCase;
        this.getOnePurchaseUseCase = getOnePurchaseUseCase;
        this.getLastPurchaseUseCase = getLastPurchaseUseCase;
        this.updatePurchaseUseCase = updatePurchaseUseCase;
        this.deletePurchaseUseCase = deletePurchaseUseCase;
    }

    @Post(value = "/purchase", consumes = MediaType.MULTIPART_FORM_DATA)
    public Mono<RestResponse<CreatePurchaseUseCaseResponse>> create(
           @Part("purchaseNo") String purchaseNo,
           @Part("date") LocalDate date,
           @Part("categoryId") Integer categoryId,
           @Part("itemId") Integer itemId,
           @Part("paymentMode") String paymentMode,
           @Part("amount") BigDecimal amount,
           @Part("remarks") String remarks,
           @Part("photoPath") String photoPath){
        var request = new CreatePurchaseUseCaseRequest(
                purchaseNo,
                date,
                categoryId,
                itemId,
                paymentMode,
                amount,
                remarks,
                photoPath
        );
        return createPurchaseUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err-> Mono.just(RestResponse.error("Unexpected on controller" +err.getLocalizedMessage())));
    }

    @Get("/purchases")
    public Flux<RestResponse<GetPurchaseUseCaseResponse>> get(){
        return getPurchaseUseCase.execute()
                .map(RestResponse::success)
                .onErrorResume(err-> Flux.just(RestResponse.error("Unexpected on controller" +err.getLocalizedMessage())));
    }

    @Get("/last/purchase")
    public Mono<RestResponse<GetPurchaseUseCaseResponse>> getLast(){
        return getLastPurchaseUseCase.execute()
                .map(RestResponse::success)
                .onErrorResume(err-> Mono.just(RestResponse.error("Unexpected on controller" +err.getLocalizedMessage())));
    }

    @Get("/purchase/{id}")
    public Mono<RestResponse<GetPurchaseUseCaseResponse>> getOne(@PathVariable Integer id){
        var request= new GetOnePurchaseUseCaseRequest(id);
        return getOnePurchaseUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err-> Mono.just(RestResponse.error("Unexpected on controller" +err.getLocalizedMessage())));
    }

    @Put(value = "/purchase", consumes = MediaType.MULTIPART_FORM_DATA)
    public Mono<RestResponse<UpdatePurchaseUseCaseResponse>> update(
            @Part("id") Integer id,
            @Part("purchaseNo") String purchaseNo,
            @Part("date") LocalDate date,
            @Part("categoryId") Integer categoryId,
            @Part("itemId") Integer itemId,
            @Part("paymentMode") String paymentMode,
            @Part("amount") BigDecimal amount,
            @Part("remarks") String remarks,
            @Part("photoPath") String photoPath){
        var request = new UpdatePurchaseUseCaseRequest(
                id,
                purchaseNo,
                date,
                categoryId,
                itemId,
                paymentMode,
                amount,
                remarks,
                photoPath
        );
        return updatePurchaseUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err-> Mono.just(RestResponse.error("Unexpected on controller" +err.getLocalizedMessage())));
    }

    @Delete("/purchase/{id}")
    public Mono<RestResponse<DeletePurchaseUseCaseResponse>> delete(@PathVariable Integer id){
        var request= new DeletePurchaseUseCaseRequest(id);
        return deletePurchaseUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err-> Mono.just(RestResponse.error("Unexpected on controller" +err.getLocalizedMessage())));

    }



}
