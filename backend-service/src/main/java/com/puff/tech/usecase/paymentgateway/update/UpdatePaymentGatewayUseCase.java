package com.puff.tech.usecase.paymentgateway.update;

import com.puff.tech.core.usecases.UseCases;
import com.puff.tech.covertor.PaymentGatewayConvertor;
import com.puff.tech.repository.PaymentGatewayRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class UpdatePaymentGatewayUseCase implements UseCases<UpdatePaymentGatewayUseCaseRequest,UpdatePaymentGatewayUseCaseResponse> {

    private final PaymentGatewayRepository paymentGatewayRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public UpdatePaymentGatewayUseCase(PaymentGatewayRepository paymentGatewayRepository,
                                       KhataBookImplementation khataBookImplementation) {
        this.paymentGatewayRepository = paymentGatewayRepository;
        this.khataBookImplementation = khataBookImplementation;
    }

    @Override
    public Mono<UpdatePaymentGatewayUseCaseResponse> execute(UpdatePaymentGatewayUseCaseRequest request) {
        return khataBookImplementation.getCurrentKhataBookId()
                .flatMap(khataBookId->
                        paymentGatewayRepository.findByIdAndKhataBookId(request.id(), khataBookId)
                                .switchIfEmpty(Mono.error(new RuntimeException("Payment gateway not found")))
                                .flatMap(paymentGatewayEntity -> {
                                    var updated= PaymentGatewayConvertor.toEntityUpdate(request,paymentGatewayEntity);
                                    return paymentGatewayRepository.update(updated)
                                            .map(saved-> new UpdatePaymentGatewayUseCaseResponse("Payment gateway updated"))
                                            .onErrorResume(err->Mono.error(new RuntimeException("Unexpected happened" +err.getLocalizedMessage())));
                                }));
    }
}
