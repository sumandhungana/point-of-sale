package com.puff.tech.usecase.rentalitem.delete;

import com.puff.tech.core.usecases.UseCase;
import com.puff.tech.repository.RentalRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import reactor.core.publisher.Mono;

public class DeleteRentalItemUseCase implements UseCase<DeleteRentalItemUseCaseRequest,DeleteRentalItemUseCaseResponse> {

    private final RentalRepository rentalRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public DeleteRentalItemUseCase(RentalRepository rentalRepository,
                                   KhataBookImplementation khataBookImplementation) {
        this.rentalRepository = rentalRepository;
        this.khataBookImplementation = khataBookImplementation;
    }

    @Override
    public Mono<DeleteRentalItemUseCaseResponse> execute(DeleteRentalItemUseCaseRequest request) {
        return khataBookImplementation.getCurrentKhataBookId()
                .flatMap(khataBookId->
                        rentalRepository.findByIdAndKhataBookId(request.id(), khataBookId)
                                .switchIfEmpty(Mono.error(new RuntimeException("Rental Item not found")))
                                .flatMap(rentalEntity ->
                                        rentalRepository.deleteById(request.id())
                                                .then(Mono.just(new DeleteRentalItemUseCaseResponse("Rental item deleted successfully")))));
    }
}
