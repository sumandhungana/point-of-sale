package com.puff.tech.usecase.rentalitem.create;

import com.puff.tech.core.usecases.UseCases;
import com.puff.tech.covertor.RentalItemConvertor;
import com.puff.tech.repository.RentalRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class CreateRentalItemUseCase implements UseCases<CreateRentalItemUseCaseRequest,CreateRentalItemUseCaseResponse> {

    private final RentalRepository rentalRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public CreateRentalItemUseCase(RentalRepository rentalRepository,
                                   KhataBookImplementation khataBookImplementation) {
        this.rentalRepository = rentalRepository;
        this.khataBookImplementation = khataBookImplementation;
    }

    @Override
    public Mono<CreateRentalItemUseCaseResponse> execute(CreateRentalItemUseCaseRequest request) {
        return khataBookImplementation.getCurrentKhataBookId()
                .flatMap(khataBookId->{
                    var rentalItem= RentalItemConvertor.toEntity(request,khataBookId);
                    return rentalRepository.save(rentalItem)
                            .map(rentalEntity -> new CreateRentalItemUseCaseResponse("Item rented"))
                            .onErrorResume(err->Mono.error(new RuntimeException("Unexpected happened" +err.getLocalizedMessage())));
                });
    }
}
