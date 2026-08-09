package com.puff.tech.usecase.service.delete;

import com.puff.tech.core.usecases.UseCase;
import com.puff.tech.repository.ServiceRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class DeleteServiceUseCase implements UseCase<DeleteServiceUseCaseRequest,DeleteServiceUseCaseResponse> {

    private final ServiceRepository serviceRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public DeleteServiceUseCase(ServiceRepository serviceRepository,
                                KhataBookImplementation khataBookImplementation) {
        this.serviceRepository = serviceRepository;
        this.khataBookImplementation = khataBookImplementation;
    }

    @Override
    public Mono<DeleteServiceUseCaseResponse> execute(DeleteServiceUseCaseRequest request) {
        return khataBookImplementation.getCurrentKhataBookId()
                .flatMap(khataBookId->
                        serviceRepository.findByIdAndKhataBookId(request.id(), khataBookId)
                                .switchIfEmpty(Mono.error(new RuntimeException("Service not found")))
                                .flatMap(serviceEntity ->
                                        serviceRepository.deleteById(request.id()))
                                .then(Mono.just(new DeleteServiceUseCaseResponse("Service deleted"))));
    }
}
