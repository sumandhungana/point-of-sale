package com.puff.tech.payment.usecase.edit;

import com.puff.tech.core.usecases.MonoUC;
import com.puff.tech.payment.repository.PaymentEntity;
import com.puff.tech.payment.repository.PaymentRepository;
import com.puff.tech.security.UseCaseContext;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class UpdatePaymentUC implements MonoUC<UpdatePaymentUCRequest, UpdatePaymentUCResponse> {

    private final PaymentRepository paymentRepository;

    public UpdatePaymentUC(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }


    @Override
    public Mono<UpdatePaymentUCResponse> execute(UpdatePaymentUCRequest request, UseCaseContext context) {
        return paymentRepository.findById(request.paymentId())
                .switchIfEmpty(Mono.error(new Throwable("Payment not found")))
                .flatMap(payment-> {
                    var updateData= this.buildPaymentEntity(request, payment);
                    return paymentRepository.update(updateData)
                            .map(newData-> UpdatePaymentUCResponse.builder()
                                    .message("Payment updated successfully")
                                    .build());
                });
    }

    private PaymentEntity buildPaymentEntity(UpdatePaymentUCRequest request, PaymentEntity entity) {


        entity.setAmount(request.amount());
        entity.setPaymentType(request.paymentType());
        entity.setPaymentCategory(request.paymentCategory());
        entity.setBillPath(request.billPath());
        entity.setRemarks(request.remarks());
        return entity;
    }
}
