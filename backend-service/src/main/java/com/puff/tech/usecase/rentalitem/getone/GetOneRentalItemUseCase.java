package com.puff.tech.usecase.rentalitem.getone;

import com.puff.tech.core.usecases.UseCases;
import com.puff.tech.covertor.RentalItemConvertor;
import com.puff.tech.repository.RentalRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import com.puff.tech.usecase.rentalitem.get.GetRentalItemUseCaseResponse;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class GetOneRentalItemUseCase implements UseCases<GetOneRentalItemUseCaseRequest, GetRentalItemUseCaseResponse> {

    private final RentalRepository rentalRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public GetOneRentalItemUseCase(RentalRepository rentalRepository,
                                   KhataBookImplementation khataBookImplementation) {
        this.rentalRepository = rentalRepository;
        this.khataBookImplementation = khataBookImplementation;
    }

    @Override
    public Mono<GetRentalItemUseCaseResponse> execute(GetOneRentalItemUseCaseRequest request) {
        return khataBookImplementation.getCurrentKhataBookId()
                .flatMap(khataBookId->
                        rentalRepository.findByIdAndKhataBookId(request.id(), khataBookId)
                                .map(RentalItemConvertor::toResponse)
                                .onErrorResume(err->Mono.error(new RuntimeException("Unexpected happened" +err.getLocalizedMessage()))));
    }
}
