package com.puff.tech.usecase.purchase.getlast;

import com.puff.tech.covertor.PurchaseConvertor;
import com.puff.tech.repository.PurchaseRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import com.puff.tech.usecase.purchase.get.GetPurchaseUseCaseResponse;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class GetLastPurchaseUseCase {

    private final PurchaseRepository purchaseRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public GetLastPurchaseUseCase(PurchaseRepository purchaseRepository,
                                  KhataBookImplementation khataBookImplementation) {
        this.purchaseRepository = purchaseRepository;
        this.khataBookImplementation = khataBookImplementation;
    }

    public Mono<GetPurchaseUseCaseResponse> execute(){
        return khataBookImplementation.getCurrentKhataBookId()
                .flatMap(khataBookId->
                        purchaseRepository.findLatestPurchase(khataBookId)
                                .map(PurchaseConvertor::toResponse)
                                .onErrorResume(err->Mono.error(new RuntimeException("Unexpected happened" +err.getLocalizedMessage()))));
    }
}
