package com.puff.tech.customermanagement.controller;

import com.puff.tech.core.responses.RestResponse;
import com.puff.tech.customermanagement.usecase.add.AddCustomerUseCase;
import com.puff.tech.customermanagement.usecase.add.AddCustomerUseCaseRequest;
import com.puff.tech.customermanagement.usecase.add.AddCustomerUseCaseResponse;
import com.puff.tech.customermanagement.usecase.delete.DeleteCustomerUseCase;
import com.puff.tech.customermanagement.usecase.delete.DeleteCustomerUseCaseRequest;
import com.puff.tech.customermanagement.usecase.delete.DeleteCustomerUseCaseResponse;
import com.puff.tech.customermanagement.usecase.get.*;
import com.puff.tech.customermanagement.usecase.getsinglecustomer.GetSingleCustomerUCRequest;
import com.puff.tech.customermanagement.usecase.getsinglecustomer.GetSingleCustomerUseCase;
import com.puff.tech.customermanagement.usecase.update.UpdateCustomerUseCase;
import com.puff.tech.customermanagement.usecase.update.UpdateCustomerUseCaseRequest;
import com.puff.tech.customermanagement.usecase.update.UpdateCustomerUseCaseResponse;
import com.puff.tech.security.Secured;
import io.micronaut.http.annotation.*;
import jakarta.inject.Inject;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;

@Controller("customer")
public class CustomerController {

    private final AddCustomerUseCase addCustomerUseCase;
    private final GetAllCustomerUseCase getAllCustomerUseCase;
//    private final GetAllCustomersUseCase getSuppliersUseCase;
    private final DeleteCustomerUseCase deleteCustomerUseCase;
    private final UpdateCustomerUseCase updateCustomerUseCase;
    private final GetSingleCustomerUseCase getSingleCustomerUseCase;
    private final GetSuppliersUseCase getSuppliersUseCase;

    @Inject
    public CustomerController(AddCustomerUseCase addCustomerUseCase,
                              GetAllCustomerUseCase getAllCustomerUseCase,
                              GetSuppliersUseCase getSuppliersUseCase,
                              DeleteCustomerUseCase deleteCustomerUseCase,
                              UpdateCustomerUseCase updateCustomerUseCase,
                              GetSingleCustomerUseCase getSingleCustomerUseCase){
        this.addCustomerUseCase=addCustomerUseCase;
        this.getAllCustomerUseCase=getAllCustomerUseCase;
        this.getSuppliersUseCase= getSuppliersUseCase;
        this.deleteCustomerUseCase=deleteCustomerUseCase;
        this.updateCustomerUseCase=updateCustomerUseCase;
        this.getSingleCustomerUseCase= getSingleCustomerUseCase;
    }

    @Secured
    @Post()
    public Mono<RestResponse<AddCustomerUseCaseResponse>> post(@Body AddCustomerUseCaseRequest request){
        return addCustomerUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err->Mono.just(RestResponse.error("Unexpected happened while adding customer" +err.getLocalizedMessage())));
    }

    @Secured(roles = {"Super Admin","ADMIN","USER"}, permissions = {"customer:view"})
    @Get("all-customers")
    public Mono<RestResponse<List<GetAllCustomerUseCaseResponse>>> getCustomers(){
        return getAllCustomerUseCase.execute(new GetCustomerUseCaseRequest())
                .collectList()
                .map(RestResponse::success)
                .onErrorResume(err->Mono.just(RestResponse.error("Unexpected happened" +err.getLocalizedMessage())));
    }

    @Secured
    @Get("{id}")
    public Mono<RestResponse<GetAllCustomerUseCaseResponse>> getSingleCustomer(@PathVariable("id") Integer id){
        GetSingleCustomerUCRequest request= new GetSingleCustomerUCRequest(id);
        return getSingleCustomerUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err->Mono.just(RestResponse.error("Unexpected happened" +err.getLocalizedMessage())));
    }

    @Secured
    @Get("suppliers")
    public Mono<RestResponse<List<GetAllCustomerUseCaseResponse>>> getSuppliers(){
        System.out.println("Calling suppliers from customets");
        return getSuppliersUseCase.execute(new GetSupplierUCRequest())
                .collectList()
                .map(RestResponse::success)
                .onErrorResume(err-> Mono.just(RestResponse.error("Unexpected happened on controller: " +err.getLocalizedMessage())));
    }

    @Secured(roles = {"ADMIN"}, permissions = {"customer:delete"})
    @Delete("{id}")
    public Mono<RestResponse<DeleteCustomerUseCaseResponse>> delete(@PathVariable Integer id){
        var request = new DeleteCustomerUseCaseRequest(id);
        return deleteCustomerUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err->Mono.just(RestResponse.error("Unexpected happened: " +err.getLocalizedMessage())));
    }

    @Secured
    @Put()
    public Mono<RestResponse<UpdateCustomerUseCaseResponse>> update(@Body UpdateCustomerUseCaseRequest request){
        return updateCustomerUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err->Mono.just(RestResponse.error("Unexpected happened: " +err.getLocalizedMessage())));
    }
}
