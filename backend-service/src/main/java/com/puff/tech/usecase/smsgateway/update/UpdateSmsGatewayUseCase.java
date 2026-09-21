package com.puff.tech.usecase.smsgateway.update;

import com.puff.tech.core.usecases.UseCases;
import com.puff.tech.covertor.SmsGatewayConvertor;
import com.puff.tech.repository.SmsGatewayRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import reactor.core.publisher.Mono;

public class UpdateSmsGatewayUseCase implements UseCases<UpdateSmsGatewayUseCaseRequest,UpdateSmsGatewayUseCaseResponse> {

    private final SmsGatewayRepository smsGatewayRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public UpdateSmsGatewayUseCase(SmsGatewayRepository smsGatewayRepository,
                                   KhataBookImplementation khataBookImplementation) {
        this.smsGatewayRepository = smsGatewayRepository;
        this.khataBookImplementation = khataBookImplementation;
    }

    @Override
    public Mono<UpdateSmsGatewayUseCaseResponse> execute(UpdateSmsGatewayUseCaseRequest request) {
        return khataBookImplementation.getCurrentKhataBookId()
                .flatMap(khataBookId->
                        smsGatewayRepository.findByIdAndKhataBookId(request.id(), khataBookId)
                                .switchIfEmpty(Mono.error(new RuntimeException("Sms not found")))
                                .flatMap(smsGatewayEntity -> {
                                    var updated= SmsGatewayConvertor.toEntityUpdate(request,smsGatewayEntity);
                                    return smsGatewayRepository.update(updated)
                                            .map(saved->new UpdateSmsGatewayUseCaseResponse("Sms updated"))
                                            .onErrorResume(err->Mono.error(new RuntimeException("Unexpected happened" +err.getLocalizedMessage())));

                                }));
    }
}
