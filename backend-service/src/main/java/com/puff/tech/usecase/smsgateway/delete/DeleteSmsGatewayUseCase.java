package com.puff.tech.usecase.smsgateway.delete;

import com.puff.tech.core.usecases.UseCases;
import com.puff.tech.repository.SmsGatewayRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class DeleteSmsGatewayUseCase implements UseCases<DeleteSmsGatewayUseCaseRequest,DeleteSmsGatewayUseCaseResponse> {

    private final SmsGatewayRepository smsGatewayRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public DeleteSmsGatewayUseCase(SmsGatewayRepository smsGatewayRepository,
                                   KhataBookImplementation khataBookImplementation) {
        this.smsGatewayRepository = smsGatewayRepository;
        this.khataBookImplementation = khataBookImplementation;
    }


    @Override
    public Mono<DeleteSmsGatewayUseCaseResponse> execute(DeleteSmsGatewayUseCaseRequest request) {
        return khataBookImplementation.getCurrentKhataBookId()
                .flatMap(khataBookId->smsGatewayRepository.findByIdAndKhataBookId(request.id(), khataBookId)
                        .switchIfEmpty(Mono.error(new RuntimeException("Sms not found")))
                        .flatMap(smsGatewayEntity ->
                                smsGatewayRepository.deleteByIdAndKhataBookId(request.id(), khataBookId))
                        .then(Mono.just(new DeleteSmsGatewayUseCaseResponse("Deleted successfully"))));
    }
}
