package com.puff.tech.usecase.payment.delete;

import com.puff.tech.core.usecases.UseCase;
import com.puff.tech.repository.PaymentRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class DeletePaymentUseCase implements UseCase<DeletePaymentUseCaseRequest,DeletePaymentUseCaseResponse> {

    private final PaymentRepository paymentRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public DeletePaymentUseCase(PaymentRepository paymentRepository,
                                KhataBookImplementation khataBookImplementation) {
        this.paymentRepository = paymentRepository;
        this.khataBookImplementation = khataBookImplementation;
    }

    @Override
    public Mono<DeletePaymentUseCaseResponse> execute(DeletePaymentUseCaseRequest request) {
        return khataBookImplementation.getCurrentKhataBookId()
                .flatMap(khataBookId->
                        paymentRepository.findByIdAndKhataBookId(request.id(), khataBookId)
                                .switchIfEmpty(Mono.error(new RuntimeException("Payment not found")))
                                .flatMap(paymentEntity -> {
                                    return paymentRepository.deleteById(request.id())
                                            .then(Mono.just(new DeletePaymentUseCaseResponse("Payment deleted successfully")));
                                }));
    }
}
