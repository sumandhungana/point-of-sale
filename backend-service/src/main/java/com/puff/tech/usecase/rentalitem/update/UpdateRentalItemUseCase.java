package com.puff.tech.usecase.rentalitem.update;

import com.puff.tech.core.usecases.UseCases;
import com.puff.tech.covertor.RentalItemConvertor;
import com.puff.tech.repository.RentalRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class UpdateRentalItemUseCase implements UseCases<UpdateRentalItemUseCaseRequest,UpdateRentalItemUseCaseResponse> {

    private final RentalRepository rentalRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public UpdateRentalItemUseCase(RentalRepository rentalRepository,
                                   KhataBookImplementation khataBookImplementation) {
        this.rentalRepository = rentalRepository;
        this.khataBookImplementation = khataBookImplementation;
    }

    @Override
    public Mono<UpdateRentalItemUseCaseResponse> execute(UpdateRentalItemUseCaseRequest request) {
        return khataBookImplementation.getCurrentKhataBookId()
                .flatMap(khataBookId->
                        rentalRepository.findByIdAndKhataBookId(request.id(), khataBookId)
                                .switchIfEmpty(Mono.error(new RuntimeException("Rental Item Not found")))
                                .flatMap(rentalEntity ->{
                                    var updated= RentalItemConvertor.toEntityUpdate(request,rentalEntity);
                                    return rentalRepository.update(updated)
                                            .map(rentalEntity1 -> new UpdateRentalItemUseCaseResponse("Rental item updated successfully"))
                                            .onErrorResume(err->Mono.error(new RuntimeException("Unexpected happened" +err.getLocalizedMessage())));
                                }));
    }
}
