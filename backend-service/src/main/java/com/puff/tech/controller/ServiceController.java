package com.puff.tech.controller;

import com.puff.tech.core.responses.RestResponse;
import com.puff.tech.usecase.service.create.CreateServiceUseCase;
import com.puff.tech.usecase.service.create.CreateServiceUseCaseRequest;
import com.puff.tech.usecase.service.create.CreateServiceUseCaseResponse;
import com.puff.tech.usecase.service.delete.DeleteServiceUseCase;
import com.puff.tech.usecase.service.delete.DeleteServiceUseCaseRequest;
import com.puff.tech.usecase.service.delete.DeleteServiceUseCaseResponse;
import com.puff.tech.usecase.service.get.GetServiceUseCase;
import com.puff.tech.usecase.service.get.GetServiceUseCaseResponse;
import com.puff.tech.usecase.service.getone.GetOneServiceUseCase;
import com.puff.tech.usecase.service.getone.GetOneServiceUseCaseRequest;
import com.puff.tech.usecase.service.update.UpdateServiceUseCase;
import com.puff.tech.usecase.service.update.UpdateServiceUseCaseRequest;
import com.puff.tech.usecase.service.update.UpdateServiceUseCaseResponse;
import io.micronaut.http.MediaType;
import io.micronaut.http.annotation.*;
import io.micronaut.http.multipart.CompletedFileUpload;
import jakarta.inject.Inject;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;

@Controller("/api/v1")
public class ServiceController {

    private final CreateServiceUseCase createServiceUseCase;
    private final GetServiceUseCase getServiceUseCase;
    private final GetOneServiceUseCase getOneServiceUseCase;
    private final UpdateServiceUseCase updateServiceUseCase;
    private final DeleteServiceUseCase deleteServiceUseCase;

    @Inject
    public ServiceController(CreateServiceUseCase createServiceUseCase,
                             GetServiceUseCase getServiceUseCase,
                             GetOneServiceUseCase getOneServiceUseCase,
                             UpdateServiceUseCase updateServiceUseCase,
                             DeleteServiceUseCase deleteServiceUseCase) {
        this.createServiceUseCase = createServiceUseCase;
        this.getServiceUseCase = getServiceUseCase;
        this.getOneServiceUseCase = getOneServiceUseCase;
        this.updateServiceUseCase = updateServiceUseCase;
        this.deleteServiceUseCase = deleteServiceUseCase;
    }

    @Post(value = "/service", consumes = MediaType.MULTIPART_FORM_DATA)
    public Mono<RestResponse<CreateServiceUseCaseResponse>> create(
          @Part("serviceName") String serviceName,
          @Part("price")  BigDecimal price,
          @Part("taxIncluded") Boolean taxIncluded,
          @Part("tax")  BigDecimal tax,
          @Part("vat")  BigDecimal vat,
          @Part("image")  CompletedFileUpload image
    ){
        var request= new CreateServiceUseCaseRequest(serviceName,price,taxIncluded,tax,vat,image);
        return createServiceUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err-> Mono.just(RestResponse.error("Unexpected on controller" +err.getLocalizedMessage())));
    }

    @Get("/services")
    public Flux<RestResponse<GetServiceUseCaseResponse>> get(){
        return getServiceUseCase.execute()
                .map(RestResponse::success)
                .onErrorResume(err-> Flux.just(RestResponse.error("Unexpected on controller" +err.getLocalizedMessage())));
    }

    @Get("/service/{id}")
    public Mono<RestResponse<GetServiceUseCaseResponse>> getOne(@PathVariable Integer id){
        var request=new GetOneServiceUseCaseRequest(id);
        return getOneServiceUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err-> Mono.just(RestResponse.error("Unexpected on controller" +err.getLocalizedMessage())));
    }

    @Put(value = "/service", consumes = MediaType.MULTIPART_FORM_DATA)
    public Mono<RestResponse<UpdateServiceUseCaseResponse>> update(
            @Part("id") Integer id,
            @Part("serviceName") String serviceName,
            @Part("price")  BigDecimal price,
            @Part("taxIncluded") Boolean taxIncluded,
            @Part("tax")  BigDecimal tax,
            @Part("vat")  BigDecimal vat,
            @Part("image")  CompletedFileUpload image
    ){
        var request= new UpdateServiceUseCaseRequest(id,serviceName,price,taxIncluded,tax,vat,image);
        return updateServiceUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err-> Mono.just(RestResponse.error("Unexpected on controller" +err.getLocalizedMessage())));
    }

    @Delete("/service/{id}")
    public Mono<RestResponse<DeleteServiceUseCaseResponse>> delete(@PathVariable Integer id){
        var request= new DeleteServiceUseCaseRequest(id);
        return deleteServiceUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err-> Mono.just(RestResponse.error("Unexpected on controller" +err.getLocalizedMessage())));
    }
}
