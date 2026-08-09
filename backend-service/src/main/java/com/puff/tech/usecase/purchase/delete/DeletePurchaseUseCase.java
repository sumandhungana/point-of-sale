package com.puff.tech.usecase.purchase.delete;

import com.puff.tech.core.usecases.UseCase;
import com.puff.tech.repository.PurchaseRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class DeletePurchaseUseCase implements UseCase<DeletePurchaseUseCaseRequest,DeletePurchaseUseCaseResponse> {

    private final PurchaseRepository purchaseRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public DeletePurchaseUseCase(PurchaseRepository purchaseRepository,
                                 KhataBookImplementation khataBookImplementation) {
        this.purchaseRepository = purchaseRepository;
        this.khataBookImplementation = khataBookImplementation;
    }

    @Override
    public Mono<DeletePurchaseUseCaseResponse> execute(DeletePurchaseUseCaseRequest request) {
        return khataBookImplementation.getCurrentKhataBookId()
                .flatMap(khataBookId->
                        purchaseRepository.findByIdAndKhataBookId(request.id(),khataBookId)
                                .switchIfEmpty(Mono.error(new RuntimeException("Purchase not found")))
                                .flatMap(purchaseEntity ->
                                        purchaseRepository.deleteById(request.id()))
                                .then(Mono.just(new DeletePurchaseUseCaseResponse("Purchase deleted")))
                );
    }
}
