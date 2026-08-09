package com.puff.tech.usecase.smsgateway.getone;

import com.puff.tech.core.usecases.UseCase;
import com.puff.tech.covertor.SmsGatewayConvertor;
import com.puff.tech.repository.SmsGatewayRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import com.puff.tech.usecase.smsgateway.get.GetSmsGatewayUseCaseResponse;
import jakarta.inject.Inject;
import reactor.core.publisher.Mono;

public class GetOneSmsUseCase implements UseCase<GetOneSmsUseCaseRequest, GetSmsGatewayUseCaseResponse> {

    private final SmsGatewayRepository smsGatewayRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public GetOneSmsUseCase(SmsGatewayRepository smsGatewayRepository,
                            KhataBookImplementation khataBookImplementation) {
        this.smsGatewayRepository = smsGatewayRepository;
        this.khataBookImplementation = khataBookImplementation;
    }

    @Override
    public Mono<GetSmsGatewayUseCaseResponse> execute(GetOneSmsUseCaseRequest request) {
        return khataBookImplementation.getCurrentKhataBookId()
                .flatMap(khataBookId->
                        smsGatewayRepository.findByIdAndKhataBookId(request.id(), khataBookId)
                                .map(SmsGatewayConvertor::toResponse)
                                .onErrorResume(err->Mono.error(new RuntimeException("Unexpected happened" +err.getLocalizedMessage()))));
    }
}
