package com.puff.tech.inventorymanagement.controller;

import com.puff.tech.core.responses.RestResponse;
import com.puff.tech.inventorymanagement.usecase.salesbill.add.AddSalesBillUC;
import com.puff.tech.inventorymanagement.usecase.salesbill.add.AddSalesBillUCRequest;
import com.puff.tech.inventorymanagement.usecase.salesbill.add.AddSalesBillUCResponse;
import com.puff.tech.inventorymanagement.usecase.salesbill.getall.GetAllSalesBillUC;
import com.puff.tech.inventorymanagement.usecase.salesbill.getall.GetAllSalesBillUCRequest;
import com.puff.tech.inventorymanagement.usecase.salesbill.getall.GetAllSalesBillUCResponse;
import com.puff.tech.inventorymanagement.usecase.salesbill.getbillnumber.GetBillNumberUC;
import com.puff.tech.inventorymanagement.usecase.salesbill.getbillnumber.GetBillNumberUCRequest;
import com.puff.tech.inventorymanagement.usecase.salesbill.getbillnumber.GetBillNumberUCResponse;
import com.puff.tech.security.Secured;
import com.puff.tech.usermanagement.enums.Permission;
import io.micronaut.http.annotation.Body;
import io.micronaut.http.annotation.Controller;
import io.micronaut.http.annotation.Get;
import io.micronaut.http.annotation.Post;
import jakarta.validation.Valid;
import reactor.core.publisher.Mono;

import java.util.List;

@Controller("sales-bill")
public class SalesBillsController {

    private final GetBillNumberUC getBillNumberUC;
    private final AddSalesBillUC addSalesBillUC;
    private final GetAllSalesBillUC getAllSalesBillUC;

    public SalesBillsController(GetBillNumberUC getBillNumberUC,
                                AddSalesBillUC addSalesBillUC,
                                GetAllSalesBillUC getAllSalesBillUC) {
        this.getBillNumberUC = getBillNumberUC;
        this.addSalesBillUC = addSalesBillUC;
        this.getAllSalesBillUC = getAllSalesBillUC;
    }

    @Secured(permissions = {Permission.SALES_BILL_ADD})
    @Post()
    public Mono<RestResponse<AddSalesBillUCResponse>> addSalesBill(@Valid @Body AddSalesBillUCRequest request) {
        return addSalesBillUC.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err -> Mono.just(RestResponse.error("Unexpected happened:: " + err.getLocalizedMessage())));
    }

    @Secured(permissions = {Permission.SALES_BILL_GENERATION})
    @Get("bill-number")
    public Mono<RestResponse<GetBillNumberUCResponse>> getSalesBillNumber() {
        return getBillNumberUC.execute(new GetBillNumberUCRequest())
                .map(RestResponse::success)
                .onErrorResume(err -> Mono.just(RestResponse.error("Unexpected happened:: " + err.getLocalizedMessage())));
    }

    @Secured(permissions = {Permission.SALES_BILL_GET_ALL})
    @Get("all-bills")
    public Mono<RestResponse<List<GetAllSalesBillUCResponse>>> getAllSalesBill() {
        return getAllSalesBillUC.execute(new GetAllSalesBillUCRequest())
                .collectList()
                .map(RestResponse::success)
                .onErrorResume(err -> Mono.just(RestResponse.error("Unexpected happened:: " + err.getLocalizedMessage())));
    }
}
