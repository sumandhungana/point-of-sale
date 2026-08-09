package com.puff.tech.controller;

import com.puff.tech.core.responses.RestResponse;
import com.puff.tech.usecase.salesbillitems.create.CreateSalesBillItemUseCase;
import com.puff.tech.usecase.salesbillitems.create.CreateSalesBillItemUseCaseRequest;
import com.puff.tech.usecase.salesbillitems.create.CreateSalesBillItemUseCaseResponse;
import com.puff.tech.usecase.salesbillitems.delete.DeleteSalesBillItemUseCase;
import com.puff.tech.usecase.salesbillitems.delete.DeleteSalesBillItemUseCaseRequest;
import com.puff.tech.usecase.salesbillitems.delete.DeleteSalesBillItemUseCaseResponse;
import com.puff.tech.usecase.salesbillitems.get.GetSalesBillItemUseCase;
import com.puff.tech.usecase.salesbillitems.get.GetSalesBillItemUseCaseResponse;
import com.puff.tech.usecase.salesbillitems.getbybill.GetSalesBillItemByBilUseCase;
import com.puff.tech.usecase.salesbillitems.getbybill.GetSalesBillItemByBilUseCaseRequest;
import com.puff.tech.usecase.salesbillitems.getone.GetOneSalesBillItemUseCase;
import com.puff.tech.usecase.salesbillitems.getone.GetOneSalesBillItemUseCaseRequest;
import com.puff.tech.usecase.salesbillitems.update.UpdateSalesBillItemUseCase;
import com.puff.tech.usecase.salesbillitems.update.UpdateSalesBillItemUseCaseRequest;
import com.puff.tech.usecase.salesbillitems.update.UpdateSalesBillItemUseCaseResponse;
import com.puff.tech.usecase.salesbills.getone.GetOneSalesBillUseCase;
import io.micronaut.http.annotation.*;
import jakarta.inject.Inject;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Controller("/api/v1")
public class SalesBillItemController {

    private final CreateSalesBillItemUseCase createSalesBillItemUseCase;
    private final GetSalesBillItemUseCase getSalesBillItemUseCase;
    private final GetOneSalesBillItemUseCase getOneSalesBillItemUseCase;
    private final GetSalesBillItemByBilUseCase getSalesBillItemByBilUseCase;
    private final UpdateSalesBillItemUseCase updateSalesBillItemUseCase;
    private final DeleteSalesBillItemUseCase deleteSalesBillItemUseCase;

    @Inject
    public SalesBillItemController(CreateSalesBillItemUseCase createSalesBillItemUseCase,
                                   GetSalesBillItemUseCase getSalesBillItemUseCase,
                                   GetOneSalesBillItemUseCase getOneSalesBillItemUseCase,
                                   GetSalesBillItemByBilUseCase getSalesBillItemByBilUseCase,
                                   UpdateSalesBillItemUseCase updateSalesBillItemUseCase,
                                   DeleteSalesBillItemUseCase deleteSalesBillItemUseCase) {
        this.createSalesBillItemUseCase = createSalesBillItemUseCase;
        this.getSalesBillItemUseCase = getSalesBillItemUseCase;
        this.getOneSalesBillItemUseCase = getOneSalesBillItemUseCase;
        this.updateSalesBillItemUseCase = updateSalesBillItemUseCase;
        this.deleteSalesBillItemUseCase = deleteSalesBillItemUseCase;
        this.getSalesBillItemByBilUseCase=getSalesBillItemByBilUseCase;
    }

    @Post("/salesbillitem")
    public Mono<RestResponse<CreateSalesBillItemUseCaseResponse>> create(@Body CreateSalesBillItemUseCaseRequest request){
        return  createSalesBillItemUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err-> Mono.just(RestResponse.error("Unexpected on controller" +err.getLocalizedMessage())));
    }

    @Get("/salesbillitems")
    public Flux<RestResponse<GetSalesBillItemUseCaseResponse>> get(){
        return getSalesBillItemUseCase.execute()
                .map(RestResponse::success)
                .onErrorResume(err-> Flux.just(RestResponse.error("Unexpected on controller" +err.getLocalizedMessage())));
    }

    @Get("/salesbillitem/{id}")
    public Mono<RestResponse<GetSalesBillItemUseCaseResponse>> getOne(@PathVariable Integer id){
        var request = new GetOneSalesBillItemUseCaseRequest(id);
        return getOneSalesBillItemUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err-> Mono.just(RestResponse.error("Unexpected on controller" +err.getLocalizedMessage())));
    }

    @Get("/salesbillitems/{salesBillId}")
    public Flux<RestResponse<GetSalesBillItemUseCaseResponse>> getByBill(@PathVariable Integer salesBillId){
        var request= new GetSalesBillItemByBilUseCaseRequest(salesBillId);
        return getSalesBillItemByBilUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err-> Flux.just(RestResponse.error("Unexpected on controller" +err.getLocalizedMessage())));
    }

    @Put("/salesbillitem")
    public Mono<RestResponse<UpdateSalesBillItemUseCaseResponse>> update(@Body UpdateSalesBillItemUseCaseRequest request){
        return updateSalesBillItemUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err-> Mono.just(RestResponse.error("Unexpected on controller" +err.getLocalizedMessage())));
    }

    @Delete("/salesbillitem/{id}")
    public Mono<RestResponse<DeleteSalesBillItemUseCaseResponse>> delete(@PathVariable Integer id){
        var request= new DeleteSalesBillItemUseCaseRequest(id);
        return deleteSalesBillItemUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err-> Mono.just(RestResponse.error("Unexpected on controller" +err.getLocalizedMessage())));
    }
}
