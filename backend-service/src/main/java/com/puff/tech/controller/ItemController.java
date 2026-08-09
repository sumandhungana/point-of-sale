package com.puff.tech.controller;

import com.puff.tech.core.responses.RestResponse;
import com.puff.tech.usecase.item.create.CreateItemUseCase;
import com.puff.tech.usecase.item.create.CreateItemUseCaseRequest;
import com.puff.tech.usecase.item.create.CreateItemUseCaseResponse;
import com.puff.tech.usecase.item.delete.DeleteItemUseCase;
import com.puff.tech.usecase.item.delete.DeleteItemUseCaseRequest;
import com.puff.tech.usecase.item.delete.DeleteItemUseCaseResponse;
import com.puff.tech.usecase.item.get.GetAllItemUseCase;
import com.puff.tech.usecase.item.get.GetItemUseCaseResponse;
import com.puff.tech.usecase.item.getone.GetOneItemUseCase;
import com.puff.tech.usecase.item.getone.GetOneItemUseCaseRequest;
import com.puff.tech.usecase.item.update.UpdateItemUseCase;
import com.puff.tech.usecase.item.update.UpdateItemUseCaseRequest;
import com.puff.tech.usecase.item.update.UpdateItemUseCaseResponse;
import io.micronaut.http.MediaType;
import io.micronaut.http.annotation.*;
import jakarta.inject.Inject;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.time.LocalDate;

@Controller("/api/v1")
public class ItemController {

    private final CreateItemUseCase createItemUseCase;
    private final GetAllItemUseCase getAllItemUseCase;
    private final GetOneItemUseCase getOneItemUseCase;
    private final UpdateItemUseCase updateItemUseCase;
    private final DeleteItemUseCase deleteItemUseCase;

    @Inject
    public ItemController(CreateItemUseCase createItemUseCase,
                          GetAllItemUseCase getAllItemUseCase,
                          GetOneItemUseCase getOneItemUseCase,
                          UpdateItemUseCase updateItemUseCase,
                          DeleteItemUseCase deleteItemUseCase) {
        this.createItemUseCase = createItemUseCase;
        this.getAllItemUseCase = getAllItemUseCase;
        this.getOneItemUseCase = getOneItemUseCase;
        this.updateItemUseCase = updateItemUseCase;
        this.deleteItemUseCase = deleteItemUseCase;
    }

    @Post(value = "/item", consumes = MediaType.MULTIPART_FORM_DATA)
    public Mono<RestResponse<CreateItemUseCaseResponse>> create(
            @Part("name") String name,
            @Part("primaryUnit") String primaryUnit,
            @Part("secondaryUnit") String secondaryUnit,
            @Part("isSecondaryUnitEnabled") Boolean isSecondaryUnitEnabled,
            @Part("categoryId") Integer categoryId,
            @Part("salesPrice") BigDecimal salesPrice,
            @Part("purchasePrice") BigDecimal purchasePrice,
            @Part("taxIncluded") Boolean taxIncluded,
            @Part("openingStock") BigDecimal openingStock,
            @Part("lowStockAlert") BigDecimal lowStockAlert,
            @Part("vatPercentage") BigDecimal vatPercentage,
            @Part("vatPercentageToday") BigDecimal vatPercentageToday,
            @Part("vatDate") LocalDate vatDate,
            @Part("photoPath") String photoPath){
        var request= new CreateItemUseCaseRequest(
                name,
                primaryUnit,
                secondaryUnit,
                isSecondaryUnitEnabled,
                categoryId,
                salesPrice,
                purchasePrice,
                taxIncluded,
                openingStock,
                lowStockAlert,
                vatPercentage,
                vatPercentageToday,
                vatDate,
                photoPath
        );
        return createItemUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err->Mono.just(RestResponse.error("Unexpected happened"+err.getLocalizedMessage())));
    }

    @Get("/items")
    public Flux<RestResponse<GetItemUseCaseResponse>> get(){
        return getAllItemUseCase.execute()
                .map(RestResponse::success)
                .onErrorResume(err->Mono.just(RestResponse.error("Unexpected happened"+err.getLocalizedMessage())));
    }

    @Get("/item/{id}")
    public Mono<RestResponse<GetItemUseCaseResponse>> getOne(@PathVariable Integer id){
        var request = new GetOneItemUseCaseRequest(id);
        return getOneItemUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err->Mono.just(RestResponse.error("Unexpected happened"+err.getLocalizedMessage())));
    }

    @Put(value = "/item" ,consumes = MediaType.MULTIPART_FORM_DATA)
    public Mono<RestResponse<UpdateItemUseCaseResponse>> update(
            @Part("id") Integer id,
            @Part("name") String name,
            @Part("primaryUnit") String primaryUnit,
            @Part("secondaryUnit") String secondaryUnit,
            @Part("isSecondaryUnitEnabled") Boolean isSecondaryUnitEnabled,
            @Part("categoryId") Integer categoryId,
            @Part("salesPrice") BigDecimal salesPrice,
            @Part("purchasePrice") BigDecimal purchasePrice,
            @Part("taxIncluded") Boolean taxIncluded,
            @Part("openingStock") BigDecimal openingStock,
            @Part("lowStockAlert") BigDecimal lowStockAlert,
            @Part("vatPercentage") BigDecimal vatPercentage,
            @Part("vatPercentageToday") BigDecimal vatPercentageToday,
            @Part("vatDate") LocalDate vatDate,
            @Part("photoPath") String photoPath){
        var request= new UpdateItemUseCaseRequest(
                id,
                name,
                primaryUnit,
                secondaryUnit,
                isSecondaryUnitEnabled,
                categoryId,
                salesPrice,
                purchasePrice,
                taxIncluded,
                openingStock,
                lowStockAlert,
                vatPercentage,
                vatPercentageToday,
                vatDate,
                photoPath
        );
        return updateItemUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err->Mono.just(RestResponse.error("Unexpected happened"+err.getLocalizedMessage())));
    }

    @Delete("/item/{id}")
    public Mono<RestResponse<DeleteItemUseCaseResponse>> delete(@PathVariable Integer id){
        var request= new DeleteItemUseCaseRequest(id);
        return deleteItemUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err->Mono.just(RestResponse.error("Unexpected happened"+err.getLocalizedMessage())));
    }


}
