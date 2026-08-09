package com.puff.tech.controller;

import com.puff.tech.core.responses.RestResponse;
import com.puff.tech.usecase.supplier.create.CreateSupplierUseCase;
import com.puff.tech.usecase.supplier.create.CreateSupplierUseCaseRequest;
import com.puff.tech.usecase.supplier.create.CreateSupplierUseCaseResponse;
import com.puff.tech.usecase.supplier.delete.DeleteSupplierUseCase;
import com.puff.tech.usecase.supplier.delete.DeleteSupplierUseCaseRequest;
import com.puff.tech.usecase.supplier.delete.DeleteSupplierUseCaseResponse;
import com.puff.tech.usecase.supplier.get.GetSupplierUseCase;
import com.puff.tech.usecase.supplier.get.GetSupplierUseCaseResponse;
import com.puff.tech.usecase.supplier.getone.GetOneSupplierUseCase;
import com.puff.tech.usecase.supplier.getone.GetOneSupplierUseCaseRequest;
import com.puff.tech.usecase.supplier.update.UpdateSupplierUseCase;
import com.puff.tech.usecase.supplier.update.UpdateSupplierUseCaseRequest;
import com.puff.tech.usecase.supplier.update.UpdateSupplierUseCaseResponse;
import io.micronaut.http.annotation.*;
import jakarta.inject.Inject;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.nio.file.AtomicMoveNotSupportedException;

@Controller("/api/v1")
public class SupplierController {

    private final CreateSupplierUseCase createSupplierUseCase;
    private final GetSupplierUseCase getSupplierUseCase;
    private final GetOneSupplierUseCase getOneSupplierUseCase;
    private final UpdateSupplierUseCase updateSupplierUseCase;
    private final DeleteSupplierUseCase deleteSupplierUseCase;

    @Inject
    public SupplierController(CreateSupplierUseCase createSupplierUseCase,
                              GetSupplierUseCase getSupplierUseCase,
                              GetOneSupplierUseCase getOneSupplierUseCase,
                              UpdateSupplierUseCase updateSupplierUseCase,
                              DeleteSupplierUseCase deleteSupplierUseCase) {
        this.createSupplierUseCase = createSupplierUseCase;
        this.getSupplierUseCase = getSupplierUseCase;
        this.getOneSupplierUseCase = getOneSupplierUseCase;
        this.updateSupplierUseCase = updateSupplierUseCase;
        this.deleteSupplierUseCase = deleteSupplierUseCase;
    }

    @Post("/supplier")
    public Mono<RestResponse<CreateSupplierUseCaseResponse>> create(@Body CreateSupplierUseCaseRequest request){
        return createSupplierUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err->Mono.just(RestResponse.error("Unexpected happened" +err.getLocalizedMessage())));
    }

    @Get("/suppliers")
    public Flux<RestResponse<GetSupplierUseCaseResponse>> get(){
        return getSupplierUseCase.execute()
                .map(RestResponse::success)
                .onErrorResume(err->Flux.just(RestResponse.error("Unexpected happened" +err.getLocalizedMessage())));
    }

    @Get("/supplier/{id}")
    public Mono<RestResponse<GetSupplierUseCaseResponse>> getOne(@PathVariable Integer id){
        var request = new GetOneSupplierUseCaseRequest(id);
        return getOneSupplierUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err->Mono.just(RestResponse.error("Unexpected happened" +err.getLocalizedMessage())));
    }

    @Put("/supplier/{id}")
    public Mono<RestResponse<UpdateSupplierUseCaseResponse>> update(@Body UpdateSupplierUseCaseRequest request){
        return updateSupplierUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err->Mono.just(RestResponse.error("Unexpected happened" +err.getLocalizedMessage())));
    }

    @Delete("/supplier/{id}")
    public Mono<RestResponse<DeleteSupplierUseCaseResponse>> delete(@PathVariable Integer id){
        var request = new DeleteSupplierUseCaseRequest(id);
        return deleteSupplierUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err->Mono.just(RestResponse.error("Unexpected happened" +err.getLocalizedMessage())));
    }
}
