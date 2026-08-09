package com.puff.tech.controller;

import com.puff.tech.core.responses.RestResponse;
import com.puff.tech.usecase.salesbills.create.CreateSalesBillUseCase;
import com.puff.tech.usecase.salesbills.create.CreateSalesBillUseCaseRequest;
import com.puff.tech.usecase.salesbills.create.CreateSalesBillUseCaseResponse;
import com.puff.tech.usecase.salesbills.delete.DeleteSalesBillUseCase;
import com.puff.tech.usecase.salesbills.delete.DeleteSalesBillUseCaseRequest;
import com.puff.tech.usecase.salesbills.delete.DeleteSalesBillUseCaseResponse;
import com.puff.tech.usecase.salesbills.get.GetSalesBillUseCase;
import com.puff.tech.usecase.salesbills.get.GetSalesBillUseCaseResponse;
import com.puff.tech.usecase.salesbills.getone.GetOneSalesBillUseCase;
import com.puff.tech.usecase.salesbills.getone.GetOneSalesBillUseCaseRequest;
import com.puff.tech.usecase.salesbills.update.UpdateSalesBillUseCase;
import com.puff.tech.usecase.salesbills.update.UpdateSalesBillUseCaseRequest;
import com.puff.tech.usecase.salesbills.update.UpdateSalesBillUseCaseResponse;
import io.micronaut.http.MediaType;
import io.micronaut.http.annotation.*;
import jakarta.inject.Inject;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.time.LocalDate;

@Controller("/api/v1")
public class SalesBillsController {

    private final CreateSalesBillUseCase createSalesBillUseCase;
    private final GetSalesBillUseCase getSalesBillUseCase;
    private final GetOneSalesBillUseCase getOneSalesBillUseCase;
    private final UpdateSalesBillUseCase updateSalesBillUseCase;
    private final DeleteSalesBillUseCase deleteSalesBillUseCase;

    @Inject
    public SalesBillsController(CreateSalesBillUseCase createSalesBillUseCase,
                                GetSalesBillUseCase getSalesBillUseCase,
                                GetOneSalesBillUseCase getOneSalesBillUseCase,
                                UpdateSalesBillUseCase updateSalesBillUseCase,
                                DeleteSalesBillUseCase deleteSalesBillUseCase) {
        this.createSalesBillUseCase = createSalesBillUseCase;
        this.getSalesBillUseCase = getSalesBillUseCase;
        this.getOneSalesBillUseCase = getOneSalesBillUseCase;
        this.updateSalesBillUseCase = updateSalesBillUseCase;
        this.deleteSalesBillUseCase = deleteSalesBillUseCase;
    }

    @Post(value = "/salesbill", consumes = MediaType.MULTIPART_FORM_DATA)
    public Mono<RestResponse<CreateSalesBillUseCaseResponse>> create(
          @Part("billNumber") String billNumber,
          @Part("billDate")  LocalDate billDate,
          @Part("customerId")  Integer customerId,
          @Part("paymentMode")  String paymentMode,
          @Part("amount")  BigDecimal amount,
          @Part("remarks")  String remarks,
          @Part("photoPath")  String photoPath
    ){
        var request= new CreateSalesBillUseCaseRequest(
                billNumber,
                billDate,
                customerId,
                paymentMode,
                amount,
                remarks,
                photoPath
        );
        return createSalesBillUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err-> Mono.just(RestResponse.error("Unexpected on controller" +err.getLocalizedMessage())));
    }

    @Get("/salesbill")
    public Flux<RestResponse<GetSalesBillUseCaseResponse>> get(){
        return getSalesBillUseCase.execute()
                .map(RestResponse::success)
                .onErrorResume(err-> Flux.just(RestResponse.error("Unexpected on controller" +err.getLocalizedMessage())));
    }

    @Get("/salesbill/{id}")
    public Mono<RestResponse<GetSalesBillUseCaseResponse>> getOne(@PathVariable Integer id){
        var request= new GetOneSalesBillUseCaseRequest(id);
        return getOneSalesBillUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err-> Mono.just(RestResponse.error("Unexpected on controller" +err.getLocalizedMessage())));
    }

    @Put(value = "/salesbill", consumes = MediaType.MULTIPART_FORM_DATA)
    public Mono<RestResponse<UpdateSalesBillUseCaseResponse>> update(
            @Part("id") Integer id,
            @Part("billNumber") String billNumber,
            @Part("billDate")  LocalDate billDate,
            @Part("customerId")  Integer customerId,
            @Part("paymentMode")  String paymentMode,
            @Part("amount")  BigDecimal amount,
            @Part("remarks")  String remarks,
            @Part("photoPath")  String photoPath
    ){
        var request= new UpdateSalesBillUseCaseRequest(
                id,
                billNumber,
                billDate,
                customerId,
                paymentMode,
                amount,
                remarks,
                photoPath
        );
        return updateSalesBillUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err-> Mono.just(RestResponse.error("Unexpected on controller" +err.getLocalizedMessage())));

    }

    @Delete("/salesbill/{id}")
    public Mono<RestResponse<DeleteSalesBillUseCaseResponse>> delete(@PathVariable Integer id){
        var request= new DeleteSalesBillUseCaseRequest(id);
        return deleteSalesBillUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err-> Mono.just(RestResponse.error("Unexpected on controller" +err.getLocalizedMessage())));

    }
}
