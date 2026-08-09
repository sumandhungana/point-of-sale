package com.puff.tech.usecase.paymentgateway.getOne;

import com.puff.tech.core.usecases.UseCase;
import com.puff.tech.covertor.KhataBookConvertor;
import com.puff.tech.covertor.PaymentGatewayConvertor;
import com.puff.tech.repository.PaymentGatewayRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import com.puff.tech.usecase.paymentgateway.get.GetPaymentGatewayUseCaseResponse;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class GetOnePaymentGatewayUseCase implements UseCase<GetOnePaymentGatewayUseCaseRequest, GetPaymentGatewayUseCaseResponse> {

    private final PaymentGatewayRepository paymentGatewayRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public GetOnePaymentGatewayUseCase(PaymentGatewayRepository paymentGatewayRepository,
                                       KhataBookImplementation khataBookImplementation) {
        this.paymentGatewayRepository = paymentGatewayRepository;
        this.khataBookImplementation = khataBookImplementation;
    }

    @Override
    public Mono<GetPaymentGatewayUseCaseResponse> execute(GetOnePaymentGatewayUseCaseRequest request) {
        return khataBookImplementation.getCurrentKhataBookId()
                .flatMap(khataBookId->
                        paymentGatewayRepository.findByIdAndKhataBookId(request.id(), khataBookId)
                                .map(PaymentGatewayConvertor::toResponse)
                                .onErrorResume(err->Mono.error(new RuntimeException("Unexpected happened" +err.getLocalizedMessage()))));
    }
}
