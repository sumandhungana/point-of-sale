package com.puff.tech.payment.controller;

import com.puff.tech.core.responses.RestResponse;
import com.puff.tech.payment.usecase.add.AddPaymentUC;
import com.puff.tech.payment.usecase.add.AddPaymentUCRequest;
import com.puff.tech.payment.usecase.add.AddPaymentUCResponse;
import com.puff.tech.payment.usecase.delete.DeletePaymentUC;
import com.puff.tech.payment.usecase.delete.DeletePaymentUCRequest;
import com.puff.tech.payment.usecase.delete.DeletePaymentUCResponse;
import com.puff.tech.payment.usecase.edit.UpdatePaymentUC;
import com.puff.tech.payment.usecase.edit.UpdatePaymentUCRequest;
import com.puff.tech.payment.usecase.edit.UpdatePaymentUCResponse;
import com.puff.tech.payment.usecase.get.GetPaymentUC;
import com.puff.tech.payment.usecase.get.GetPaymentUCRequest;
import com.puff.tech.payment.usecase.get.GetPaymentUCResponse;
import com.puff.tech.security.Secured;
import com.puff.tech.usermanagement.enums.Permission;
import io.micronaut.http.annotation.*;
import reactor.core.publisher.Mono;

import java.util.List;

@Controller("payment")
public class PaymentController {
    private final AddPaymentUC addPaymentUC;
    private final GetPaymentUC getPaymentUC;
    private final UpdatePaymentUC updatePaymentUC;
    private final DeletePaymentUC deletePaymentUC;

    public PaymentController(AddPaymentUC addPaymentUC, GetPaymentUC getPaymentUC, UpdatePaymentUC updatePaymentUC, DeletePaymentUC deletePaymentUC) {
        this.addPaymentUC = addPaymentUC;
        this.getPaymentUC = getPaymentUC;
        this.updatePaymentUC = updatePaymentUC;
        this.deletePaymentUC = deletePaymentUC;
    }

    @Secured(permissions = {
            Permission.CUSTOMER_PAYMENT,
            Permission.SUPPLIER_PAYMENT,
            Permission.STAFF_PAYMENT,
            Permission.RENTAL_PAYMENT,
            Permission.RENTAL_ADD,
            Permission.RENTAL_CREATE,
            Permission.RENTAL_GET_ALL,
            Permission.RENTAL_LIST,
            Permission.LOAN_PAYMENT
    })
    @Post("add")
    Mono<RestResponse<AddPaymentUCResponse>> addPayment(@Body AddPaymentUCRequest request) {
        return addPaymentUC.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err -> Mono.just(RestResponse.error("Unexpected happened:: " + err.getLocalizedMessage())));
    }

    @Secured(permissions = {
            Permission.CUSTOMER_PAYMENT,
            Permission.SUPPLIER_PAYMENT,
            Permission.STAFF_PAYMENT,
            Permission.RENTAL_PAYMENT,
            Permission.RENTAL_ADD,
            Permission.RENTAL_CREATE,
            Permission.RENTAL_GET_ALL,
            Permission.RENTAL_LIST,
            Permission.LOAN_PAYMENT
    })
    @Post("list")
    Mono<RestResponse<List<GetPaymentUCResponse>>> getPayment(@Body GetPaymentUCRequest request) {
        return getPaymentUC.execute(request)
                .collectList()
                .map(RestResponse::success)
                .onErrorResume(err -> Mono.just(RestResponse.error("Unexpected error happened: " + err.getLocalizedMessage())));
    }

    @Secured(permissions = {
            Permission.CUSTOMER_PAYMENT,
            Permission.SUPPLIER_PAYMENT,
            Permission.STAFF_PAYMENT,
            Permission.RENTAL_PAYMENT,
            Permission.RENTAL_ADD,
            Permission.RENTAL_CREATE,
            Permission.RENTAL_GET_ALL,
            Permission.RENTAL_LIST,
            Permission.LOAN_PAYMENT
    })
    @Put("update")
    public Mono<RestResponse<UpdatePaymentUCResponse>> update(@Body UpdatePaymentUCRequest request){
        return updatePaymentUC.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err -> Mono.just(RestResponse.error("Unexpected happened:: " + err.getLocalizedMessage())));
    }

    @Secured(permissions = {
            Permission.CUSTOMER_PAYMENT,
            Permission.SUPPLIER_PAYMENT,
            Permission.STAFF_PAYMENT,
            Permission.RENTAL_PAYMENT,
            Permission.RENTAL_ADD,
            Permission.RENTAL_CREATE,
            Permission.RENTAL_GET_ALL,
            Permission.RENTAL_LIST,
            Permission.LOAN_PAYMENT
    })
    @Delete("delete/{id}")
    public Mono<RestResponse<DeletePaymentUCResponse>> delete(@PathVariable Long id){
        var request= new DeletePaymentUCRequest(id);
        return deletePaymentUC.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err -> Mono.just(RestResponse.error("Unexpected happened:: " + err.getLocalizedMessage())));
    }

}
