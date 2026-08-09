package com.puff.tech.controller;

import com.puff.tech.core.responses.RestResponse;
import com.puff.tech.usecase.rentalitem.create.CreateRentalItemUseCase;
import com.puff.tech.usecase.rentalitem.create.CreateRentalItemUseCaseRequest;
import com.puff.tech.usecase.rentalitem.create.CreateRentalItemUseCaseResponse;
import com.puff.tech.usecase.rentalitem.delete.DeleteRentalItemUseCase;
import com.puff.tech.usecase.rentalitem.delete.DeleteRentalItemUseCaseRequest;
import com.puff.tech.usecase.rentalitem.delete.DeleteRentalItemUseCaseResponse;
import com.puff.tech.usecase.rentalitem.get.GetRentalItemUseCase;
import com.puff.tech.usecase.rentalitem.get.GetRentalItemUseCaseResponse;
import com.puff.tech.usecase.rentalitem.getone.GetOneRentalItemUseCase;
import com.puff.tech.usecase.rentalitem.getone.GetOneRentalItemUseCaseRequest;
import com.puff.tech.usecase.rentalitem.update.UpdateRentalItemUseCase;
import com.puff.tech.usecase.rentalitem.update.UpdateRentalItemUseCaseRequest;
import com.puff.tech.usecase.rentalitem.update.UpdateRentalItemUseCaseResponse;
import io.micronaut.http.annotation.*;
import jakarta.inject.Inject;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Controller("/api/v1")
public class RentalItemController {

    private final CreateRentalItemUseCase createRentalItemUseCase;
    private final GetRentalItemUseCase getRentalItemUseCase;
    private final GetOneRentalItemUseCase getOneRentalItemUseCase;
    private final UpdateRentalItemUseCase updateRentalItemUseCase;
    private final DeleteRentalItemUseCase deleteRentalItemUseCase;

    @Inject
    public RentalItemController(CreateRentalItemUseCase createRentalItemUseCase,
                                GetRentalItemUseCase getRentalItemUseCase,
                                GetOneRentalItemUseCase getOneRentalItemUseCase,
                                UpdateRentalItemUseCase updateRentalItemUseCase,
                                DeleteRentalItemUseCase deleteRentalItemUseCase) {
        this.createRentalItemUseCase = createRentalItemUseCase;
        this.getRentalItemUseCase = getRentalItemUseCase;
        this.getOneRentalItemUseCase = getOneRentalItemUseCase;
        this.updateRentalItemUseCase = updateRentalItemUseCase;
        this.deleteRentalItemUseCase = deleteRentalItemUseCase;
    }

    @Post("/rental")
    public Mono<RestResponse<CreateRentalItemUseCaseResponse>> create(@Body CreateRentalItemUseCaseRequest request){
        return createRentalItemUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err-> Mono.just(RestResponse.error("Unexpected on controller" +err.getLocalizedMessage())));
    }

    @Get("/rentals")
    public Flux<RestResponse<GetRentalItemUseCaseResponse>> get(){
        return getRentalItemUseCase.execute()
                .map(RestResponse::success)
                .onErrorResume(err-> Flux.just(RestResponse.error("Unexpected on controller" +err.getLocalizedMessage())));
    }

    @Get("/rental/{id}")
    public Mono<RestResponse<GetRentalItemUseCaseResponse>> getOne(@PathVariable Integer id){
        var request= new GetOneRentalItemUseCaseRequest(id);
        return getOneRentalItemUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err-> Mono.just(RestResponse.error("Unexpected on controller" +err.getLocalizedMessage())));
    }

    @Put("/rental")
    public Mono<RestResponse<UpdateRentalItemUseCaseResponse>> update(@Body UpdateRentalItemUseCaseRequest request){
        return updateRentalItemUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err-> Mono.just(RestResponse.error("Unexpected on controller" +err.getLocalizedMessage())));
    }

    @Delete("/delete/{id}")
    public Mono<RestResponse<DeleteRentalItemUseCaseResponse>> delete(@PathVariable Integer id){
        var request= new DeleteRentalItemUseCaseRequest(id);
        return deleteRentalItemUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err-> Mono.just(RestResponse.error("Unexpected on controller" +err.getLocalizedMessage())));
    }
}
