package com.puff.tech.usecase.paymentgateway.delete;

import com.puff.tech.core.usecases.UseCase;
import com.puff.tech.repository.PaymentGatewayRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class DeletePaymentGatewayUseCase implements UseCase<DeletePaymentGatewayUseCaseRequest,DeletePaymentGatewayUseCaseResponse> {

    private final PaymentGatewayRepository paymentGatewayRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public DeletePaymentGatewayUseCase(PaymentGatewayRepository paymentGatewayRepository,
                                       KhataBookImplementation khataBookImplementation) {
        this.paymentGatewayRepository = paymentGatewayRepository;
        this.khataBookImplementation = khataBookImplementation;
    }

    @Override
    public Mono<DeletePaymentGatewayUseCaseResponse> execute(DeletePaymentGatewayUseCaseRequest request) {
        return khataBookImplementation.getCurrentKhataBookId()
                .flatMap(khataBookId->
                        paymentGatewayRepository.findByIdAndKhataBookId(request.id(), khataBookId)
                                .switchIfEmpty(Mono.error(new RuntimeException("Payment gateway not found")))
                                .flatMap(paymentGatewayEntity ->
                                        paymentGatewayRepository.deleteById(request.id())
                                                .then(Mono.just(new DeletePaymentGatewayUseCaseResponse("Payment gateway deleted")))));
    }
}
