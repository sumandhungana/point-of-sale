package com.puff.tech.payment.controller;

import com.puff.tech.core.responses.RestResponse;
import com.puff.tech.payment.usecase.add.AddPaymentUC;
import com.puff.tech.payment.usecase.add.AddPaymentUCRequest;
import com.puff.tech.payment.usecase.add.AddPaymentUCResponse;
import com.puff.tech.payment.usecase.get.GetPaymentUC;
import com.puff.tech.payment.usecase.get.GetPaymentUCRequest;
import com.puff.tech.payment.usecase.get.GetPaymentUCResponse;
import com.puff.tech.security.Secured;
import com.puff.tech.usermanagement.enums.Permission;
import io.micronaut.http.annotation.Body;
import io.micronaut.http.annotation.Controller;
import io.micronaut.http.annotation.Post;
import reactor.core.publisher.Mono;

import java.util.List;

@Controller("payment")
public class PaymentController {
    private final AddPaymentUC addPaymentUC;
    private final GetPaymentUC getPaymentUC;

    public PaymentController(AddPaymentUC addPaymentUC, GetPaymentUC getPaymentUC) {
        this.addPaymentUC = addPaymentUC;
        this.getPaymentUC = getPaymentUC;
    }

    @Secured(permissions = {Permission.CUSTOMER_PAYMENT, Permission.SUPPLIER_PAYMENT, Permission.STAFF_PAYMENT})
    @Post("add")
    Mono<RestResponse<AddPaymentUCResponse>> addPayment(@Body AddPaymentUCRequest request) {
        return addPaymentUC.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err -> Mono.just(RestResponse.error("Unexpected happened:: " + err.getLocalizedMessage())));
    }

    @Secured(permissions = {Permission.CUSTOMER_PAYMENT, Permission.SUPPLIER_PAYMENT, Permission.STAFF_PAYMENT})
    @Post("list")
    Mono<RestResponse<List<GetPaymentUCResponse>>> getPayment(@Body GetPaymentUCRequest request) {
        return getPaymentUC.execute(request)
                .collectList()
                .map(RestResponse::success)
                .onErrorResume(err -> Mono.just(RestResponse.error("Unexpected error happened: " + err.getLocalizedMessage())));
    }

}
