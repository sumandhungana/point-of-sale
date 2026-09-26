package com.puff.tech.suppliermanagement.controller;

import com.puff.tech.core.responses.RestResponse;
import com.puff.tech.security.Secured;
import com.puff.tech.suppliermanagement.usecase.create.CreateSupplierUseCase;
import com.puff.tech.suppliermanagement.usecase.create.CreateSupplierUseCaseRequest;
import com.puff.tech.suppliermanagement.usecase.create.CreateSupplierUseCaseResponse;
//import com.puff.tech.suppliermanagement.usecase.delete.DeleteSupplierUseCase;
import com.puff.tech.suppliermanagement.usecase.delete.DeleteSupplierUseCase;
import com.puff.tech.suppliermanagement.usecase.delete.DeleteSupplierUseCaseRequest;
import com.puff.tech.suppliermanagement.usecase.delete.DeleteSupplierUseCaseResponse;
import com.puff.tech.suppliermanagement.usecase.get.GetSupplierUseCase;
import com.puff.tech.suppliermanagement.usecase.get.GetSupplierUseCaseResponse;
import com.puff.tech.suppliermanagement.usecase.get.GetSuppliersUseCaseRequest;
import com.puff.tech.suppliermanagement.usecase.getone.GetOneSupplierUseCase;
import com.puff.tech.suppliermanagement.usecase.getone.GetOneSupplierUseCaseRequest;
import com.puff.tech.suppliermanagement.usecase.update.UpdateSupplierUseCase;
import com.puff.tech.suppliermanagement.usecase.update.UpdateSupplierUseCaseRequest;
import com.puff.tech.suppliermanagement.usecase.update.UpdateSupplierUseCaseResponse;
import io.micronaut.http.annotation.*;
import jakarta.inject.Inject;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;

@Controller("/supplier")
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
                              DeleteSupplierUseCase deleteSupplierUseCase
                              ) {
        this.createSupplierUseCase = createSupplierUseCase;
        this.getSupplierUseCase = getSupplierUseCase;
        this.getOneSupplierUseCase = getOneSupplierUseCase;
        this.updateSupplierUseCase = updateSupplierUseCase;
        this.deleteSupplierUseCase = deleteSupplierUseCase;
    }

    @Secured
    @Post()
    public Mono<RestResponse<CreateSupplierUseCaseResponse>> create(@Body CreateSupplierUseCaseRequest request){
        return createSupplierUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err->Mono.just(RestResponse.error("Unexpected happened" +err.getLocalizedMessage())));
    }

    @Secured
    @Get("all")
    public Mono<RestResponse<List<GetSupplierUseCaseResponse>>> get(){
        return getSupplierUseCase.execute(new GetSuppliersUseCaseRequest())
                .collectList()
                .map(RestResponse::success)
                .onErrorResume(err->Mono.just(RestResponse.error("Unexpected happened" +err.getLocalizedMessage())));
    }

    @Secured
    @Get("/{id}")
    public Mono<RestResponse<GetSupplierUseCaseResponse>> getOne(@PathVariable Integer id){
        var request = new GetOneSupplierUseCaseRequest(id);
        return getOneSupplierUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err->Mono.just(RestResponse.error("Unexpected happened" +err.getLocalizedMessage())));
    }

    @Secured
    @Put()
    public Mono<RestResponse<UpdateSupplierUseCaseResponse>> update(@Body UpdateSupplierUseCaseRequest request){
        return updateSupplierUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err->Mono.just(RestResponse.error("Unexpected happened" +err.getLocalizedMessage())));
    }

    @Secured
    @Delete("/{id}")
    public Mono<RestResponse<DeleteSupplierUseCaseResponse>> delete(@PathVariable Integer id){
        var request = new DeleteSupplierUseCaseRequest(id);
        return deleteSupplierUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err->Mono.just(RestResponse.error("Unexpected happened" +err.getLocalizedMessage())));
    }
}
