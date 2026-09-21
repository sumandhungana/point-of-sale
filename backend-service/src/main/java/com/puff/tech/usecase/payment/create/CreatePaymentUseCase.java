package com.puff.tech.usecase.payment.create;

import com.puff.tech.core.usecases.UseCases;
import com.puff.tech.covertor.PaymentConvertor;
import com.puff.tech.repository.PaymentRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class CreatePaymentUseCase implements UseCases<CreatePaymentUseCaseRequest,CreatePaymentUseCaseResponse> {

    private final PaymentRepository paymentRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public CreatePaymentUseCase(PaymentRepository paymentRepository,
                                KhataBookImplementation khataBookImplementation) {
        this.paymentRepository = paymentRepository;
        this.khataBookImplementation = khataBookImplementation;
    }

    @Override
    public Mono<CreatePaymentUseCaseResponse> execute(CreatePaymentUseCaseRequest request) {
        return khataBookImplementation.getCurrentKhataBookId()
                .flatMap(khataBookId->{
                    var payment= PaymentConvertor.toEntity(request,khataBookId);
                    return paymentRepository.save(payment)
                            .map(paymentEntity -> new CreatePaymentUseCaseResponse("Payment created"));
                });
    }
}
