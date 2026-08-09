package com.puff.tech.usecase.smsgateway.get;

import com.puff.tech.covertor.SmsGatewayConvertor;
import com.puff.tech.repository.SmsGatewayRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Flux;

@Singleton
public class GetSmsGatewayUseCase {

    private final SmsGatewayRepository smsGatewayRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public GetSmsGatewayUseCase(SmsGatewayRepository smsGatewayRepository,
                                KhataBookImplementation khataBookImplementation) {
        this.smsGatewayRepository = smsGatewayRepository;
        this.khataBookImplementation = khataBookImplementation;
    }

    public Flux<GetSmsGatewayUseCaseResponse> execute(){
        return khataBookImplementation.getCurrentKhataBookId()
                .flatMapMany(khataBookId->
                        smsGatewayRepository.findByKhataBookIdOrderByCreatedAtDesc(khataBookId)
                                .map(SmsGatewayConvertor::toResponse)
                                .onErrorResume(err->Flux.error(new RuntimeException("Unexpected happened" +err.getLocalizedMessage()))));
    }
}
