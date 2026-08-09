package com.puff.tech.usecase.rentalitem.get;

import com.puff.tech.covertor.RentalItemConvertor;
import com.puff.tech.repository.RentalRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Flux;

@Singleton
public class GetRentalItemUseCase {

    private final RentalRepository rentalRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public GetRentalItemUseCase(RentalRepository rentalRepository,
                                KhataBookImplementation khataBookImplementation) {
        this.rentalRepository = rentalRepository;
        this.khataBookImplementation = khataBookImplementation;
    }

    public Flux<GetRentalItemUseCaseResponse> execute(){
        return khataBookImplementation.getCurrentKhataBookId()
                .flatMapMany(khataBookId->
                        rentalRepository.findByKhataBookIdOrderByCreatedAtDesc(khataBookId)
                                .map(RentalItemConvertor::toResponse)
                                .onErrorResume(err->Flux.error(new RuntimeException("Unexpected happened" +err.getLocalizedMessage()))));
    }
}
