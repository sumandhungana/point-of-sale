package com.puff.tech.usecase.service.create;

import com.puff.tech.core.usecases.UseCases;
import com.puff.tech.covertor.ServiceConvertor;
import com.puff.tech.repository.ServiceRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class CreateServiceUseCase implements UseCases<CreateServiceUseCaseRequest,CreateServiceUseCaseResponse> {

    private final ServiceRepository serviceRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public CreateServiceUseCase(ServiceRepository serviceRepository,
                                KhataBookImplementation khataBookImplementation) {
        this.serviceRepository = serviceRepository;
        this.khataBookImplementation = khataBookImplementation;
    }

    @Override
    public Mono<CreateServiceUseCaseResponse> execute(CreateServiceUseCaseRequest request) {
        return khataBookImplementation.getCurrentKhataBookId()
                .flatMap(khataBookId->{
                    var service= ServiceConvertor.toEntity(request,khataBookId);
                    return serviceRepository.save(service)
                            .map(saved->new CreateServiceUseCaseResponse("Service created"))
                            .onErrorResume(err->Mono.error(new RuntimeException("Unexpected happened" +err.getLocalizedMessage())));
                });
    }
}
