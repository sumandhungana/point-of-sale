package com.puff.tech.usecase.item.update;

import com.puff.tech.core.usecases.UseCases;
import com.puff.tech.covertor.ItemConvertor;
import com.puff.tech.repository.ItemRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import reactor.core.publisher.Mono;

public class UpdateItemUseCase implements UseCases<UpdateItemUseCaseRequest,UpdateItemUseCaseResponse> {

    private final ItemRepository itemRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public UpdateItemUseCase(ItemRepository itemRepository,
                             KhataBookImplementation khataBookImplementation) {
        this.itemRepository = itemRepository;
        this.khataBookImplementation = khataBookImplementation;
    }

    @Override
    public Mono<UpdateItemUseCaseResponse> execute(UpdateItemUseCaseRequest request) {
        return khataBookImplementation.getCurrentKhataBookId()
                .flatMap(khataBookId->
                        itemRepository.findByIdAndKhataBookId(request.id(), khataBookId)
                                .switchIfEmpty(Mono.error(new RuntimeException("Item not found")))
                                .flatMap(item->{
                                    var updated= ItemConvertor.toUpdateEntity(request,item);
                                    return itemRepository.update(updated)
                                            .map(itemEntity -> new UpdateItemUseCaseResponse("Item updated successfully"))
                                            .onErrorResume(err->Mono.error(new RuntimeException("Unexpected happened" +err.getLocalizedMessage())));
                                }));
    }
}
