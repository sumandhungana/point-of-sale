package com.puff.tech.usecase.service.update;

import com.puff.tech.core.usecases.UseCases;
import com.puff.tech.covertor.ServiceConvertor;
import com.puff.tech.repository.ServiceRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import reactor.core.publisher.Mono;

public class UpdateServiceUseCase implements UseCases<UpdateServiceUseCaseRequest,UpdateServiceUseCaseResponse> {

    private final ServiceRepository serviceRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public UpdateServiceUseCase(ServiceRepository serviceRepository,
                                KhataBookImplementation khataBookImplementation) {
        this.serviceRepository = serviceRepository;
        this.khataBookImplementation = khataBookImplementation;
    }


    @Override
    public Mono<UpdateServiceUseCaseResponse> execute(UpdateServiceUseCaseRequest request) {
        return khataBookImplementation.getCurrentKhataBookId()
                .flatMap(khataBookId->serviceRepository.findByIdAndKhataBookId(request.id(), khataBookId)
                        .switchIfEmpty(Mono.error(new RuntimeException("Service not found")))
                        .flatMap(serviceEntity -> {
                            var service= ServiceConvertor.toEntityUpdate(request,serviceEntity);
                            return serviceRepository.update(service)
                                    .map(saved->new UpdateServiceUseCaseResponse("Service updated"))
                                    .onErrorResume(err->Mono.error(new RuntimeException("Unexpected happened" +err.getLocalizedMessage())));
                        }));
    }
}
