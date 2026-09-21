package com.puff.tech.usecase.item.create;

import com.puff.tech.core.usecases.UseCases;
import com.puff.tech.covertor.ItemConvertor;
import com.puff.tech.repository.ItemRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class CreateItemUseCase implements UseCases<CreateItemUseCaseRequest,CreateItemUseCaseResponse> {

    private final ItemRepository itemRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public CreateItemUseCase(ItemRepository itemRepository,
                             KhataBookImplementation khataBookImplementation) {
        this.itemRepository = itemRepository;
        this.khataBookImplementation = khataBookImplementation;
    }

    @Override
    public Mono<CreateItemUseCaseResponse> execute(CreateItemUseCaseRequest request) {
        return khataBookImplementation.getCurrentKhataBookId()
                .flatMap(khataBookId->{
                    var item= ItemConvertor.toEntity(request,khataBookId);
                    return itemRepository.save(item)
                            .map(itemEntity -> new CreateItemUseCaseResponse("New item created"))
                            .onErrorResume(err->Mono.error(new RuntimeException("Unexpected happened"+ err.getLocalizedMessage())));
                });
    }
}
