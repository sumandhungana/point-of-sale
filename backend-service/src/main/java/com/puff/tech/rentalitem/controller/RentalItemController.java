package com.puff.tech.rentalitem.controller;

import com.puff.tech.core.responses.RestResponse;
import com.puff.tech.rentalitem.usecase.add.AddRentalUC;
import com.puff.tech.rentalitem.usecase.add.AddRentalUCRequest;
import com.puff.tech.rentalitem.usecase.add.AddRentalUCResponse;
import com.puff.tech.rentalitem.usecase.getall.GetAllRentalUC;
import com.puff.tech.rentalitem.usecase.getall.GetAllRentalUCRequest;
import com.puff.tech.rentalitem.usecase.getall.GetAllRentalUCResponse;
import com.puff.tech.security.Secured;
import com.puff.tech.usermanagement.enums.Permission;
import io.micronaut.http.annotation.Body;
import io.micronaut.http.annotation.Controller;
import io.micronaut.http.annotation.Get;
import io.micronaut.http.annotation.Post;
import reactor.core.publisher.Mono;

import java.util.List;

@Controller("rental")
public class RentalItemController {

    private final AddRentalUC addRentalUC;
    private final GetAllRentalUC getAllRentalUC;

    public RentalItemController(AddRentalUC addRentalUC,
                                GetAllRentalUC getAllRentalUC) {
        this.addRentalUC = addRentalUC;
        this.getAllRentalUC = getAllRentalUC;
    }

    @Secured(permissions = {Permission.RENTAL_ADD, Permission.RENTAL_CREATE})
    @Post
    public Mono<RestResponse<AddRentalUCResponse>> addRental(@Body AddRentalUCRequest payload) {
        return addRentalUC.execute(payload)
                .map(RestResponse::success)
                .onErrorResume(err -> Mono.just(RestResponse.error("Error on Controller:: " + err.getLocalizedMessage())));
    }

    @Secured(permissions = {Permission.RENTAL_GET_ALL, Permission.RENTAL_LIST})
    @Get("list")
    public Mono<RestResponse<List<GetAllRentalUCResponse>>> getAllRentalItems() {
        return getAllRentalUC.execute(new GetAllRentalUCRequest())
                .collectList()
                .map(RestResponse::success)
                .onErrorResume(err -> Mono.just(RestResponse.error("Unexpected happened:: " + err.getLocalizedMessage())));
    }
}
