package com.puff.tech.usecase.service.getone;

import com.puff.tech.core.usecases.UseCases;
import com.puff.tech.covertor.ServiceConvertor;
import com.puff.tech.repository.ServiceRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import com.puff.tech.usecase.service.get.GetServiceUseCaseResponse;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class GetOneServiceUseCase implements UseCases<GetOneServiceUseCaseRequest, GetServiceUseCaseResponse> {

    private final ServiceRepository serviceRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public GetOneServiceUseCase(ServiceRepository serviceRepository,
                                KhataBookImplementation khataBookImplementation) {
        this.serviceRepository = serviceRepository;
        this.khataBookImplementation = khataBookImplementation;
    }

    @Override
    public Mono<GetServiceUseCaseResponse> execute(GetOneServiceUseCaseRequest request) {
        return khataBookImplementation.getCurrentKhataBookId()
                .flatMap(khataBookId->
                        serviceRepository.findByIdAndKhataBookId(request.id(), khataBookId)
                                .map(ServiceConvertor::toResponse)
                                .onErrorResume(err->Mono.error(new RuntimeException("Unexpected happened" +err.getLocalizedMessage()))));
    }
}
