package com.puff.tech.usecase.paymentgateway.get;

import com.puff.tech.covertor.PaymentGatewayConvertor;
import com.puff.tech.repository.PaymentGatewayRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Flux;

@Singleton
public class GetPaymentGatewayUseCase {

    private final PaymentGatewayRepository paymentGatewayRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public GetPaymentGatewayUseCase(PaymentGatewayRepository paymentGatewayRepository,
                                    KhataBookImplementation khataBookImplementation) {
        this.paymentGatewayRepository = paymentGatewayRepository;
        this.khataBookImplementation = khataBookImplementation;
    }

    public Flux<GetPaymentGatewayUseCaseResponse> execute(){
        return khataBookImplementation.getCurrentKhataBookId()
                .flatMapMany(khataBookId->
                        paymentGatewayRepository.findByKhataBookIdOrderByCreatedAtDesc(khataBookId)
                                .map(PaymentGatewayConvertor::toResponse)
                                .onErrorResume(err->Flux.error(new RuntimeException("Unexpected happened" +err.getLocalizedMessage()))));
    }
}
