package com.puff.tech.usecase.payment.getone;

import com.puff.tech.core.usecases.UseCase;
import com.puff.tech.covertor.PaymentConvertor;
import com.puff.tech.repository.PaymentRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import com.puff.tech.usecase.payment.get.GetPaymentUseCaseResponse;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class GetOnePaymentUseCase implements UseCase<GetOnePaymentUseCaseRequest, GetPaymentUseCaseResponse> {

    private final PaymentRepository paymentRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public GetOnePaymentUseCase(PaymentRepository paymentRepository,
                                KhataBookImplementation khataBookImplementation) {
        this.paymentRepository = paymentRepository;
        this.khataBookImplementation = khataBookImplementation;
    }

    @Override
    public Mono<GetPaymentUseCaseResponse> execute(GetOnePaymentUseCaseRequest request) {
        return khataBookImplementation.getCurrentKhataBookId()
                .flatMap(khataBookId->
                        paymentRepository.findByIdAndKhataBookId(request.id(), khataBookId)
                                .map(PaymentConvertor::toResponse)
                                .onErrorResume(err->Mono.error(new RuntimeException("Unexpected happened" +err.getLocalizedMessage()))));
    }
}
