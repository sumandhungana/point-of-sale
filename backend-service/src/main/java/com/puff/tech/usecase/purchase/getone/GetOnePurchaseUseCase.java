package com.puff.tech.usecase.purchase.getone;

import com.puff.tech.core.usecases.UseCases;
import com.puff.tech.covertor.PurchaseConvertor;
import com.puff.tech.repository.PurchaseRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import com.puff.tech.usecase.purchase.get.GetPurchaseUseCaseResponse;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class GetOnePurchaseUseCase implements UseCases<GetOnePurchaseUseCaseRequest, GetPurchaseUseCaseResponse> {

    private final PurchaseRepository purchaseRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public GetOnePurchaseUseCase(PurchaseRepository purchaseRepository,
                                 KhataBookImplementation khataBookImplementation) {
        this.purchaseRepository = purchaseRepository;
        this.khataBookImplementation = khataBookImplementation;
    }

    @Override
    public Mono<GetPurchaseUseCaseResponse> execute(GetOnePurchaseUseCaseRequest request) {
        return khataBookImplementation.getCurrentKhataBookId()
                .flatMap(khataBookId->
                        purchaseRepository.findByIdAndKhataBookId(request.id(), khataBookId)
                                .map(PurchaseConvertor::toResponse)
                                .onErrorResume(err->Mono.error(new RuntimeException("Unexpected happened" +err.getLocalizedMessage()))));
    }
}
