package com.puff.tech.usecase.item.get;

import com.puff.tech.covertor.ItemConvertor;
import com.puff.tech.repository.ItemRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Flux;

@Singleton
public class GetAllItemUseCase {

    private final ItemRepository itemRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public GetAllItemUseCase(ItemRepository itemRepository,
                             KhataBookImplementation khataBookImplementation) {
        this.itemRepository = itemRepository;
        this.khataBookImplementation = khataBookImplementation;
    }

    public Flux<GetItemUseCaseResponse> execute(){
        return khataBookImplementation.getCurrentKhataBookId()
                .flatMapMany(khataBookId->
                     itemRepository.findByKhataBookIdOrderByCreatedAtDesc(khataBookId)
                            .map(ItemConvertor::toResponse)
                            .onErrorResume(err->Flux.error(new RuntimeException("Unexpected happened" +err.getLocalizedMessage())))
                );
    }
}
