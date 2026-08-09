package com.puff.tech.usecase.purchase.create;

import com.puff.tech.core.usecases.UseCase;
import com.puff.tech.covertor.PurchaseConvertor;
import com.puff.tech.repository.CategoryRepository;
import com.puff.tech.repository.ItemRepository;
import com.puff.tech.repository.PurchaseRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class CreatePurchaseUseCase implements UseCase<CreatePurchaseUseCaseRequest,CreatePurchaseUseCaseResponse> {

    private final PurchaseRepository purchaseRepository;
    private final CategoryRepository categoryRepository;
    private final ItemRepository itemRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public CreatePurchaseUseCase(PurchaseRepository purchaseRepository,
                                 CategoryRepository categoryRepository,
                                 ItemRepository itemRepository,
                                 KhataBookImplementation khataBookImplementation) {
        this.purchaseRepository = purchaseRepository;
        this.categoryRepository = categoryRepository;
        this.itemRepository = itemRepository;
        this.khataBookImplementation = khataBookImplementation;
    }

    @Override
    public Mono<CreatePurchaseUseCaseResponse> execute(CreatePurchaseUseCaseRequest request) {
        return khataBookImplementation.getCurrentKhataBookId()
                .flatMap(khataBookId->
                        itemRepository.findById(request.itemId())
                                .switchIfEmpty(Mono.error(new RuntimeException("Item not found")))
                                .flatMap(itemEntity ->
                                        categoryRepository.findById(request.categoryId())
                                                .switchIfEmpty(Mono.error(new RuntimeException("Category not found"))))
                                .flatMap(purchase->{
                                    var purchaseEntity= PurchaseConvertor.toEntity(request,khataBookId);
                                    return purchaseRepository.save(purchaseEntity)
                                            .map(purchaseEntity1 -> new CreatePurchaseUseCaseResponse("Purchase created"))
                                            .onErrorResume(err->Mono.error(new RuntimeException("Unexpected happened" +err.getLocalizedMessage())));
                                }));


    }
}
