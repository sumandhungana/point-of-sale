package com.puff.tech.payment.controller;

import com.puff.tech.core.responses.RestResponse;
import com.puff.tech.payment.usecase.add.AddPaymentUC;
import com.puff.tech.payment.usecase.add.AddPaymentUCRequest;
import com.puff.tech.payment.usecase.add.AddPaymentUCResponse;
import com.puff.tech.payment.usecase.get.GetPaymentUC;
import com.puff.tech.payment.usecase.get.GetPaymentUCRequest;
import com.puff.tech.payment.usecase.get.GetPaymentUCResponse;
import com.puff.tech.security.Secured;
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

    @Secured(roles = {"Super Admin", "ADMIN", "User"})
    @Post("add")
    Mono<RestResponse<AddPaymentUCResponse>> addPayment(@Body AddPaymentUCRequest request) {
        return addPaymentUC.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err -> Mono.just(RestResponse.error("Unexpected happened:: " + err.getLocalizedMessage())));
    }

    @Secured(roles = {"Super Admin", "ADMIN", "User"})
    @Post("list")
    Mono<RestResponse<List<GetPaymentUCResponse>>> getPayment(@Body GetPaymentUCRequest request) {
        return getPaymentUC.execute(request)
                .collectList()
                .map(RestResponse::success)
                .onErrorResume(err -> Mono.just(RestResponse.error("Unexpected error happened: " + err.getLocalizedMessage())));
    }

}
