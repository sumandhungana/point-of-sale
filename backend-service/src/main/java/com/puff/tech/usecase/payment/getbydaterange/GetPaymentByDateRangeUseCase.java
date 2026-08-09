package com.puff.tech.usecase.payment.getbydaterange;


import com.puff.tech.covertor.PaymentConvertor;
import com.puff.tech.repository.PaymentRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import com.puff.tech.usecase.payment.get.GetPaymentUseCaseResponse;
import com.puff.tech.usecase.payment.getbydate.GetPaymentByDateUseCaseRequest;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Flux;

@Singleton
public class GetPaymentByDateRangeUseCase {

    private final PaymentRepository paymentRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public GetPaymentByDateRangeUseCase(PaymentRepository paymentRepository,
                                   KhataBookImplementation khataBookImplementation) {
        this.paymentRepository = paymentRepository;
        this.khataBookImplementation = khataBookImplementation;
    }


    public Flux<GetPaymentUseCaseResponse> execute(GetPaymentByDateRangeUseCaseRequest request) {
        return khataBookImplementation.getCurrentKhataBookId()
                .flatMapMany(khataBookId->
                        paymentRepository.findByPaymentDateBetweenAndKhataBookIdOrderByPaymentDateDesc(request.startDate(),request.endDate(),khataBookId)
                                .map(PaymentConvertor::toResponse)
                                .onErrorResume(err->Flux.error(new RuntimeException("Unexpected happened" +err.getLocalizedMessage()))));
    }
}
