package com.puff.tech.usecase.payment.getbydate;

import com.puff.tech.core.usecases.UseCase;
import com.puff.tech.covertor.PaymentConvertor;
import com.puff.tech.repository.PaymentRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import com.puff.tech.usecase.payment.get.GetPaymentUseCaseResponse;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Singleton
public class GetPaymentByDateUseCase  {

    private final PaymentRepository paymentRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public GetPaymentByDateUseCase(PaymentRepository paymentRepository,
                                   KhataBookImplementation khataBookImplementation) {
        this.paymentRepository = paymentRepository;
        this.khataBookImplementation = khataBookImplementation;
    }


    public Flux<GetPaymentUseCaseResponse> execute(GetPaymentByDateUseCaseRequest request) {
        return khataBookImplementation.getCurrentKhataBookId()
                .flatMapMany(khataBookId->
                        paymentRepository.findByPaymentDateAndKhataBookIdOrderByCreatedAtDesc(request.date(),khataBookId)
                                .map(PaymentConvertor::toResponse)
                                .onErrorResume(err->Flux.error(new RuntimeException("Unexpected happened" +err.getLocalizedMessage()))));
    }
}
