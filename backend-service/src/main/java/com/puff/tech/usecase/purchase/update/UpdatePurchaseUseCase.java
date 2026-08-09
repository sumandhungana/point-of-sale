package com.puff.tech.usecase.purchase.update;

import com.puff.tech.core.usecases.UseCase;
import com.puff.tech.covertor.PurchaseConvertor;
import com.puff.tech.repository.PurchaseRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class UpdatePurchaseUseCase implements UseCase<UpdatePurchaseUseCaseRequest,UpdatePurchaseUseCaseResponse> {

    private final PurchaseRepository purchaseRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public UpdatePurchaseUseCase(PurchaseRepository purchaseRepository,
                                 KhataBookImplementation khataBookImplementation) {
        this.purchaseRepository = purchaseRepository;
        this.khataBookImplementation = khataBookImplementation;
    }

    @Override
    public Mono<UpdatePurchaseUseCaseResponse> execute(UpdatePurchaseUseCaseRequest request) {
        return khataBookImplementation.getCurrentKhataBookId()
                .flatMap(khataBookId->purchaseRepository.findByIdAndKhataBookId(request.id(), khataBookId)
                        .switchIfEmpty(Mono.error(new RuntimeException("Purchase not found to update")))
                        .flatMap(purchaseEntity -> {
                            var updated= PurchaseConvertor.toEntityUpdate(request,purchaseEntity);
                            return purchaseRepository.update(updated)
                                    .map(newPurchase->new UpdatePurchaseUseCaseResponse("Purchase updated successfully"))
                                    .onErrorResume(err->Mono.error(new RuntimeException("Unexpected happened" +err.getLocalizedMessage())));
                        }));
    }
}
