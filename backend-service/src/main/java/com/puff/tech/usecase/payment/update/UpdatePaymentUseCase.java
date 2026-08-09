package com.puff.tech.usecase.payment.update;

import com.puff.tech.core.usecases.UseCase;
import com.puff.tech.covertor.PaymentConvertor;
import com.puff.tech.repository.PaymentRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class UpdatePaymentUseCase implements UseCase<UpdatePaymentUseCaseRequest,UpdatePaymentUseCaseResponse> {

    private final PaymentRepository paymentRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public UpdatePaymentUseCase(PaymentRepository paymentRepository,
                                KhataBookImplementation khataBookImplementation) {
        this.paymentRepository = paymentRepository;
        this.khataBookImplementation = khataBookImplementation;
    }

    @Override
    public Mono<UpdatePaymentUseCaseResponse> execute(UpdatePaymentUseCaseRequest request) {
        return khataBookImplementation.getCurrentKhataBookId()
                .flatMap(khataBookId->
                        paymentRepository.findByIdAndKhataBookId(request.id(), khataBookId)
                                .switchIfEmpty(Mono.error(new RuntimeException("Payment not found")))
                                .flatMap(paymentEntity -> {
                                    var updated= PaymentConvertor.toEntityUpdate(request,paymentEntity);
                                    return paymentRepository.update(updated)
                                            .map(newPayment->new UpdatePaymentUseCaseResponse("Payment updated successfully"))
                                            .onErrorResume(err->Mono.error(new RuntimeException("Unexpected happened" +err.getLocalizedMessage())));
                                }));
    }
}
