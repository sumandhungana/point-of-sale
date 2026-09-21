package com.puff.tech.usecase.paymentgateway.create;

import com.puff.tech.core.usecases.UseCases;
import com.puff.tech.covertor.PaymentGatewayConvertor;
import com.puff.tech.repository.PaymentGatewayRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class CreatePaymentGatewayUseCase implements UseCases<CreatePaymentGatewayUseCaseRequest,CreatePaymentGatewayUseCaseResponse> {

    private final PaymentGatewayRepository paymentGatewayRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public CreatePaymentGatewayUseCase(PaymentGatewayRepository paymentGatewayRepository,
                                       KhataBookImplementation khataBookImplementation) {
        this.paymentGatewayRepository = paymentGatewayRepository;
        this.khataBookImplementation = khataBookImplementation;
    }

    @Override
    public Mono<CreatePaymentGatewayUseCaseResponse> execute(CreatePaymentGatewayUseCaseRequest request) {
        return khataBookImplementation.getCurrentKhataBookId()
                .flatMap(khataBookId-> {
                    var paymentGateway = PaymentGatewayConvertor.toEntity(request,khataBookId);
                    return paymentGatewayRepository.save(paymentGateway)
                            .map(saved->new CreatePaymentGatewayUseCaseResponse("Payment gateway created"))
                            .onErrorResume(err->Mono.error(new RuntimeException("Unexpected happenend" +err.getLocalizedMessage())));
                });
    }
}
