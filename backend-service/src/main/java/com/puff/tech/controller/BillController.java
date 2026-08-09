package com.puff.tech.controller;

import com.puff.tech.core.responses.RestResponse;
import com.puff.tech.usecase.bill.create.CreateBillUseCase;
import com.puff.tech.usecase.bill.create.CreateBillUseCaseRequest;
import com.puff.tech.usecase.bill.create.CreateBillUseCaseResponse;
import com.puff.tech.usecase.bill.delete.DeleteBillUseCase;
import com.puff.tech.usecase.bill.delete.DeleteBillUseCaseResponse;
import com.puff.tech.usecase.bill.getall.GetAllBillUseCase;
import com.puff.tech.usecase.bill.getall.GetAllBillUseCaseResponse;
import com.puff.tech.usecase.bill.getsinglebill.GetSingleBillUseCase;
import com.puff.tech.usecase.bill.update.UpdateBillUseCase;
import com.puff.tech.usecase.bill.update.UpdateBillUseCaseRequest;
import com.puff.tech.usecase.bill.update.UpdateBillUseCaseResponse;
import io.micronaut.http.annotation.*;
import jakarta.inject.Inject;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Controller("/api/v1")
public class BillController {

    private final CreateBillUseCase createBillUseCase;
    private final GetAllBillUseCase getAllBillUseCase;
    private final GetSingleBillUseCase getSingleBillUseCase;
    private final DeleteBillUseCase deleteBillUseCase;
    private final UpdateBillUseCase updateBillUseCase;

    @Inject
    public BillController(CreateBillUseCase createBillUseCase,
                          GetAllBillUseCase getAllBillUseCase,
                          GetSingleBillUseCase getSingleBillUseCase,
                          DeleteBillUseCase deleteBillUseCase,
                          UpdateBillUseCase updateBillUseCase) {
        this.createBillUseCase = createBillUseCase;
        this.getAllBillUseCase=getAllBillUseCase;
        this.getSingleBillUseCase= getSingleBillUseCase;
        this.deleteBillUseCase= deleteBillUseCase;
        this.updateBillUseCase= updateBillUseCase;
    }

    @Post("/bill")
    public Mono<RestResponse<CreateBillUseCaseResponse>> create(@Body CreateBillUseCaseRequest request){
        return createBillUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err->Mono.just(RestResponse.error("Unexpected happened " +err.getLocalizedMessage())));
    }

    @Get("/bills")
    public Flux<RestResponse<GetAllBillUseCaseResponse>> get(){
        return getAllBillUseCase.execute()
                .map(RestResponse::success)
                .onErrorResume(err->Mono.just(RestResponse.error("Unexpected happened"+ err.getLocalizedMessage())));
    }

    @Get("/bill/{id}")
    public Mono<RestResponse<GetAllBillUseCaseResponse>> getOne(@PathVariable Long id){
        return getSingleBillUseCase.execute(id)
                .map(RestResponse::success)
                .onErrorResume(err->Mono.just(RestResponse.error("Unexpected happened" +err.getLocalizedMessage())));
    }

    @Delete("/bill/{id}")
    public Mono<RestResponse<DeleteBillUseCaseResponse>> delete(@PathVariable Long id){
        return deleteBillUseCase.execute(id)
                .map(RestResponse::success)
                .onErrorResume(err->Mono.just(RestResponse.error("Unexpected happened" +err.getLocalizedMessage())));
    }

    @Put("/bill/{id}")
    public Mono<RestResponse<UpdateBillUseCaseResponse>> update(@PathVariable Long id,
                                                                @Body UpdateBillUseCaseRequest updateBillUseCaseRequest){
        return updateBillUseCase.execute(id,updateBillUseCaseRequest)
                .map(RestResponse::success)
                .onErrorResume(err->Mono.just(RestResponse.error("Unexpected happened" +err.getLocalizedMessage())));
    }


}
