package com.puff.tech.usecase.service.get;

import com.puff.tech.covertor.ServiceConvertor;
import com.puff.tech.repository.ServiceRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import io.micronaut.serde.annotation.Serdeable;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Flux;

@Singleton
public class GetServiceUseCase {

    private final ServiceRepository serviceRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public GetServiceUseCase(ServiceRepository serviceRepository,
                             KhataBookImplementation khataBookImplementation) {
        this.serviceRepository = serviceRepository;
        this.khataBookImplementation = khataBookImplementation;
    }

    public Flux<GetServiceUseCaseResponse> execute(){
        return khataBookImplementation.getCurrentKhataBookId()
                .flatMapMany(khataBookId->
                        serviceRepository.findByKhataBookIdOrderByCreatedAtDesc(khataBookId)
                                .map(ServiceConvertor::toResponse)
                                .onErrorResume(err-> Flux.error(new RuntimeException("Unexpected happened" +err.getLocalizedMessage()))));
    }
}
