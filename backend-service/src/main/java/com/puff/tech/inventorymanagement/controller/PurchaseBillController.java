package com.puff.tech.inventorymanagement.controller;

import com.puff.tech.core.responses.RestResponse;
import com.puff.tech.inventorymanagement.usecase.purchasebill.add.AddPurchaseBillUC;
import com.puff.tech.inventorymanagement.usecase.purchasebill.add.AddPurchaseBillUCRequest;
import com.puff.tech.inventorymanagement.usecase.purchasebill.add.AddPurchaseBillUCResponse;
import com.puff.tech.inventorymanagement.usecase.purchasebill.getall.GetAllPurchaseBillUC;
import com.puff.tech.inventorymanagement.usecase.purchasebill.getall.GetAllPurchaseBillUCRequest;
import com.puff.tech.inventorymanagement.usecase.purchasebill.getall.GetAllPurchaseBillUCResponse;
import com.puff.tech.security.Secured;
import com.puff.tech.usermanagement.enums.Permission;
import io.micronaut.http.annotation.Body;
import io.micronaut.http.annotation.Controller;
import io.micronaut.http.annotation.Get;
import io.micronaut.http.annotation.Post;
import jakarta.validation.Valid;
import reactor.core.publisher.Mono;

import java.util.List;

@Controller("purchase-bill")
public class PurchaseBillController {

    private final AddPurchaseBillUC addPurchaseBillUC;
    private final GetAllPurchaseBillUC getAllPurchaseBillUC;

    public PurchaseBillController(AddPurchaseBillUC addPurchaseBillUC, GetAllPurchaseBillUC getAllPurchaseBillUC) {
        this.addPurchaseBillUC = addPurchaseBillUC;
        this.getAllPurchaseBillUC = getAllPurchaseBillUC;
    }

    @Secured(permissions = {Permission.PURCHASE_BILL_ADD})
    @Post()
    public Mono<RestResponse<AddPurchaseBillUCResponse>> addPurchaseBill(@Valid @Body AddPurchaseBillUCRequest request) {
        return addPurchaseBillUC.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err -> Mono.just(RestResponse.error("Unexpected happened:: " + err.getLocalizedMessage())));
    }

    @Secured(permissions = {Permission.PURCHASE_BILL_GET_ALL})
    @Get("all-bills")
    public Mono<RestResponse<List<GetAllPurchaseBillUCResponse>>> getAllSalesBill() {
        return getAllPurchaseBillUC.execute(new GetAllPurchaseBillUCRequest())
                .collectList()
                .map(RestResponse::success)
                .onErrorResume(err -> Mono.just(RestResponse.error("Unexpected happened:: " + err.getLocalizedMessage())));
    }
}
