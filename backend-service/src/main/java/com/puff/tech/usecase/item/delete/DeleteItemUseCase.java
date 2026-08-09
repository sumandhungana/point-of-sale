package com.puff.tech.usecase.item.delete;

import com.puff.tech.core.usecases.UseCase;
import com.puff.tech.repository.ItemRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class DeleteItemUseCase implements UseCase<DeleteItemUseCaseRequest,DeleteItemUseCaseResponse> {

    private final ItemRepository itemRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public DeleteItemUseCase(ItemRepository itemRepository,
                             KhataBookImplementation khataBookImplementation) {
        this.itemRepository = itemRepository;
        this.khataBookImplementation = khataBookImplementation;
    }

    @Override
    public Mono<DeleteItemUseCaseResponse> execute(DeleteItemUseCaseRequest request) {
        return khataBookImplementation.getCurrentKhataBookId()
                .flatMap(khataBookId->
                        itemRepository.findByIdAndKhataBookId(request.id(), khataBookId)
                                .switchIfEmpty(Mono.error(new RuntimeException("Item not fouund")))
                                .flatMap(item->{
                                    return itemRepository.deleteById(request.id())
                                            .then(Mono.just(new DeleteItemUseCaseResponse("Item deleted")));
                                })
                );
    }
}
