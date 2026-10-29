package com.puff.tech.inventorymanagement.controller;

import com.puff.tech.core.responses.RestResponse;
import com.puff.tech.inventorymanagement.usecase.purchasebill.getsingle.GetSinglePurchaseBillUCRequest;
import com.puff.tech.inventorymanagement.usecase.purchasebill.getsingle.GetSinglePurchaseBillUCResponse;
import com.puff.tech.inventorymanagement.usecase.purchasebill.update.UpdatePurchaseBillUCRequest;
import com.puff.tech.inventorymanagement.usecase.purchasebill.update.UpdatePurchaseBillUCResponse;
import com.puff.tech.inventorymanagement.usecase.salesbill.add.AddSalesBillUC;
import com.puff.tech.inventorymanagement.usecase.salesbill.add.AddSalesBillUCRequest;
import com.puff.tech.inventorymanagement.usecase.salesbill.add.AddSalesBillUCResponse;
import com.puff.tech.inventorymanagement.usecase.salesbill.getall.GetAllSalesBillUC;
import com.puff.tech.inventorymanagement.usecase.salesbill.getall.GetAllSalesBillUCRequest;
import com.puff.tech.inventorymanagement.usecase.salesbill.getall.GetAllSalesBillUCResponse;
import com.puff.tech.inventorymanagement.usecase.salesbill.getbillnumber.GetBillNumberUC;
import com.puff.tech.inventorymanagement.usecase.salesbill.getbillnumber.GetBillNumberUCRequest;
import com.puff.tech.inventorymanagement.usecase.salesbill.getbillnumber.GetBillNumberUCResponse;
import com.puff.tech.inventorymanagement.usecase.salesbill.getsingle.GetSingleSalesBillUC;
import com.puff.tech.inventorymanagement.usecase.salesbill.getsingle.GetSingleSalesBillUCRequest;
import com.puff.tech.inventorymanagement.usecase.salesbill.getsingle.GetSingleSalesBillUCResponse;
import com.puff.tech.inventorymanagement.usecase.salesbill.update.UpdateSalesBillUC;
import com.puff.tech.inventorymanagement.usecase.salesbill.update.UpdateSalesBillUCRequest;
import com.puff.tech.inventorymanagement.usecase.salesbill.update.UpdateSalesBillUCResponse;
import com.puff.tech.security.Secured;
import com.puff.tech.usermanagement.enums.Permission;
import io.micronaut.http.annotation.*;
import jakarta.validation.Valid;
import reactor.core.publisher.Mono;

import java.util.List;

@Controller("sales-bill")
public class SalesBillsController {

    private final GetBillNumberUC getBillNumberUC;
    private final AddSalesBillUC addSalesBillUC;
    private final GetAllSalesBillUC getAllSalesBillUC;
    private final GetSingleSalesBillUC getSingleSalesBillUC;
    private final UpdateSalesBillUC updateSalesBillUC;

    public SalesBillsController(GetBillNumberUC getBillNumberUC,
                                AddSalesBillUC addSalesBillUC,
                                GetAllSalesBillUC getAllSalesBillUC, GetSingleSalesBillUC getSingleSalesBillUC, UpdateSalesBillUC updateSalesBillUC) {
        this.getBillNumberUC = getBillNumberUC;
        this.addSalesBillUC = addSalesBillUC;
        this.getAllSalesBillUC = getAllSalesBillUC;
        this.getSingleSalesBillUC = getSingleSalesBillUC;
        this.updateSalesBillUC = updateSalesBillUC;
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

    @Secured(permissions = {Permission.SALES_BILL_GET_SINGLE})
    @Get()
    public Mono<RestResponse<GetSingleSalesBillUCResponse>> getSinglePurchaseBill(@QueryValue("id") Long id) {
        return getSingleSalesBillUC.execute(new GetSingleSalesBillUCRequest(id))
                .map(RestResponse::success)
                .onErrorResume(err -> Mono.just(RestResponse.error("Unexpected happened:: " + err.getLocalizedMessage())));
    }

    @Secured(permissions = {Permission.SALES_BILL_UPDATE})
    @Put
    public Mono<RestResponse<UpdateSalesBillUCResponse>> edit(@Body UpdateSalesBillUCRequest request) {
        return updateSalesBillUC.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err -> Mono.just(RestResponse.error("Unexpected happened:: " + err.getLocalizedMessage())));
    }
}
