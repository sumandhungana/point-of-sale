package com.puff.tech.usecase.payment.get;

import com.puff.tech.covertor.PaymentConvertor;
import com.puff.tech.repository.PaymentRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Flux;

@Singleton
public class GetPaymentUseCase {

    private final PaymentRepository paymentRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public GetPaymentUseCase(PaymentRepository paymentRepository,
                             KhataBookImplementation khataBookImplementation) {
        this.paymentRepository = paymentRepository;
        this.khataBookImplementation = khataBookImplementation;
    }

    public Flux<GetPaymentUseCaseResponse> execute(){
        return khataBookImplementation.getCurrentKhataBookId()
                .flatMapMany(khataBookId->
                        paymentRepository.findByKhataBookIdOrderByPaymentDateDesc(khataBookId)
                                .map(PaymentConvertor::toResponse)
                                .onErrorResume(err->Flux.error(new RuntimeException("Unexpected happened" +err.getLocalizedMessage()))));
    }
}
