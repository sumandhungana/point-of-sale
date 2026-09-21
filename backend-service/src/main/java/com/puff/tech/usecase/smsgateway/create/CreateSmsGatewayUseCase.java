package com.puff.tech.usecase.smsgateway.create;

import com.puff.tech.core.usecases.UseCases;
import com.puff.tech.covertor.SmsGatewayConvertor;
import com.puff.tech.repository.SmsGatewayRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class CreateSmsGatewayUseCase implements UseCases<CreateSmsGatewayUseCaseRequest,CreateSmsGatewayUseCaseResponse> {

    private final SmsGatewayRepository smsGatewayRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public CreateSmsGatewayUseCase(SmsGatewayRepository smsGatewayRepository,
                                   KhataBookImplementation khataBookImplementation) {
        this.smsGatewayRepository = smsGatewayRepository;
        this.khataBookImplementation = khataBookImplementation;
    }

    @Override
    public Mono<CreateSmsGatewayUseCaseResponse> execute(CreateSmsGatewayUseCaseRequest request) {
        return khataBookImplementation.getCurrentKhataBookId()
                .flatMap(khataBookId->{
                    var smsGateway= SmsGatewayConvertor.toEntity(request,khataBookId);
                    return smsGatewayRepository.save(smsGateway)
                            .map(saved->new CreateSmsGatewayUseCaseResponse("Sms gateway created"))
                            .onErrorResume(err->Mono.error(new RuntimeException("Unexpected happened" +err.getLocalizedMessage())));
                });
    }
}
