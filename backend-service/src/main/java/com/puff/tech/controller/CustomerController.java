package com.puff.tech.controller;

import com.puff.tech.core.responses.RestResponse;
import com.puff.tech.usecase.customer.add.AddCustomerUseCase;
import com.puff.tech.usecase.customer.add.AddCustomerUseCaseRequest;
import com.puff.tech.usecase.customer.add.AddCustomerUseCaseResponse;
import com.puff.tech.usecase.customer.delete.DeleteCustomerUseCase;
import com.puff.tech.usecase.customer.delete.DeleteCustomerUseCaseResponse;
import com.puff.tech.usecase.customer.get.GetAllCustomerUseCase;
import com.puff.tech.usecase.customer.get.GetAllCustomerUseCaseResponse;
import com.puff.tech.usecase.customer.get.GetSuppliersUseCase;
import com.puff.tech.usecase.customer.update.UpdateCustomerUseCase;
import com.puff.tech.usecase.customer.update.UpdateCustomerUseCaseRequest;
import com.puff.tech.usecase.customer.update.UpdateCustomerUseCaseResponse;
import io.micronaut.http.annotation.*;
import jakarta.inject.Inject;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Controller("/api/v1")
public class CustomerController {

    private final AddCustomerUseCase addCustomerUseCase;
    private final GetAllCustomerUseCase getAllCustomerUseCase;
    private final GetSuppliersUseCase getSuppliersUseCase;
    private final DeleteCustomerUseCase deleteCustomerUseCase;
    private final UpdateCustomerUseCase updateCustomerUseCase;

    @Inject
    public CustomerController(AddCustomerUseCase addCustomerUseCase,
                              GetAllCustomerUseCase getAllCustomerUseCase,
                              GetSuppliersUseCase getSuppliersUseCase,
                              DeleteCustomerUseCase deleteCustomerUseCase,
                              UpdateCustomerUseCase updateCustomerUseCase){
        this.addCustomerUseCase=addCustomerUseCase;
        this.getAllCustomerUseCase=getAllCustomerUseCase;
        this.getSuppliersUseCase= getSuppliersUseCase;
        this.deleteCustomerUseCase=deleteCustomerUseCase;
        this.updateCustomerUseCase=updateCustomerUseCase;
    }

    @Post("/customer")
    public Mono<RestResponse<AddCustomerUseCaseResponse>> post(@Body AddCustomerUseCaseRequest request){
        return addCustomerUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err->Mono.just(RestResponse.error("Unexpected happened while adding customer" +err.getLocalizedMessage())));
    }

    @Get("/customers")
    public Flux<RestResponse<GetAllCustomerUseCaseResponse>> getCustomers(){
        return getAllCustomerUseCase.execute()
                .map(RestResponse::success)
                .onErrorResume(err->Flux.just(RestResponse.error("Unexpected happened" +err.getLocalizedMessage())));
    }

    @Get("/suppliers")
    public Flux<RestResponse<GetAllCustomerUseCaseResponse>> getSuppliers(){
        return getSuppliersUseCase.exeecute()
                .map(RestResponse::success)
                .onErrorResume(err-> Mono.just(RestResponse.error("Unexpected happened" +err.getLocalizedMessage())));
    }

    @Delete("/customer/{id}")
    public Mono<RestResponse<DeleteCustomerUseCaseResponse>> delete(Integer id){
        return deleteCustomerUseCase.execute(id)
                .map(RestResponse::success)
                .onErrorResume(err->Mono.just(RestResponse.error("Unexpected happened" +err.getLocalizedMessage())));
    }

    @Put("/customer/{id}")
    public Mono<RestResponse<UpdateCustomerUseCaseResponse>> update(@Body UpdateCustomerUseCaseRequest request,
                                                                    @PathVariable Integer id){
        return updateCustomerUseCase.execute(request,id)
                .map(RestResponse::success)
                .onErrorResume(err->Mono.just(RestResponse.error("Unexpected happened" +err.getLocalizedMessage())));
    }
}
