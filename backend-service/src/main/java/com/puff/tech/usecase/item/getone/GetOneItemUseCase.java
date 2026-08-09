package com.puff.tech.usecase.item.getone;

import com.puff.tech.core.usecases.UseCase;
import com.puff.tech.covertor.ItemConvertor;
import com.puff.tech.repository.ItemRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import com.puff.tech.usecase.item.get.GetItemUseCaseResponse;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class GetOneItemUseCase implements UseCase<GetOneItemUseCaseRequest, GetItemUseCaseResponse> {

    private final ItemRepository itemRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public GetOneItemUseCase(ItemRepository itemRepository,
                             KhataBookImplementation khataBookImplementation) {
        this.itemRepository = itemRepository;
        this.khataBookImplementation = khataBookImplementation;
    }

    @Override
    public Mono<GetItemUseCaseResponse> execute(GetOneItemUseCaseRequest request) {
        return khataBookImplementation.getCurrentKhataBookId()
                .flatMap(khataBookId->
                        itemRepository.findByIdAndKhataBookId(request.id(), khataBookId)
                                .map(ItemConvertor::toResponse)
                                .onErrorResume(err->Mono.error(new RuntimeException("Unexpected happened" +err.getLocalizedMessage()))));
    }
}
