package com.puff.tech.usecase.purchase.get;

import com.puff.tech.covertor.PurchaseConvertor;
import com.puff.tech.repository.PurchaseRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Flux;

@Singleton
public class GetPurchaseUseCase {

    private final PurchaseRepository purchaseRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public GetPurchaseUseCase(PurchaseRepository purchaseRepository,
                              KhataBookImplementation khataBookImplementation) {
        this.purchaseRepository = purchaseRepository;
        this.khataBookImplementation = khataBookImplementation;
    }

    public Flux<GetPurchaseUseCaseResponse> execute(){
        return khataBookImplementation.getCurrentKhataBookId()
                .flatMapMany(khataBookId->
                        purchaseRepository.findByKhataBookIdOrderByCreatedAtDesc(khataBookId)
                                .map(PurchaseConvertor::toResponse)
                                .onErrorResume(err->Flux.error(new RuntimeException("Unexpected happened" +err.getLocalizedMessage()))));
    }
}
