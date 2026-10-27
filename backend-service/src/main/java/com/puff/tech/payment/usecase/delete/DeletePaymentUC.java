package com.puff.tech.payment.usecase.delete;

import com.puff.tech.core.usecases.MonoUC;
import com.puff.tech.payment.repository.PaymentRepository;
import com.puff.tech.security.UseCaseContext;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class DeletePaymentUC implements MonoUC<DeletePaymentUCRequest, DeletePaymentUCResponse> {

    private final PaymentRepository paymentRepository;

    public DeletePaymentUC(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    @Override
    public Mono<DeletePaymentUCResponse> execute(DeletePaymentUCRequest request, UseCaseContext context) {
        return paymentRepository.findById(request.paymentId())
                .switchIfEmpty(Mono.error(new Throwable("Payment not found")))
                .flatMap(payment->
                        paymentRepository.deleteById(request.paymentId())
                                .then(Mono.just(DeletePaymentUCResponse.builder()
                                        .message("Payment deleted successfully")
                                        .build()))
                                .onErrorResume(err->Mono.just(DeletePaymentUCResponse.builder()
                                        .message("Failed to delete payment: " +err.getLocalizedMessage())
                                        .build())));
    }
}
