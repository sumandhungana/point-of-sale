package com.puff.tech.usecase.cashbook.create;

import com.puff.tech.covertor.CashBookConvertor;
import com.puff.tech.entity.CashBookEntity;
import com.puff.tech.repository.CashBookRepository;
import com.puff.tech.repository.CategoryRepository;
import com.puff.tech.repository.ItemRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

import java.io.IOException;

@Singleton
public class CreateCashBookUseCase {

    private final CashBookRepository cashBookRepository;
    private final CategoryRepository categoryRepository;
    private final ItemRepository itemRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public CreateCashBookUseCase(CashBookRepository cashBookRepository,
                                 CategoryRepository categoryRepository,
                                 ItemRepository itemRepository,
                                 KhataBookImplementation khataBookImplementation) {
        this.cashBookRepository = cashBookRepository;
        this.categoryRepository = categoryRepository;
        this.itemRepository = itemRepository;
        this.khataBookImplementation = khataBookImplementation;
    }

    public Mono<CreateCashBookUseCaseResponse> execute(CreateCashBookUseCaseRequest request) throws IOException {

        return khataBookImplementation.getCurrentKhataBookId()
                .flatMap(khataBookId ->


                        itemRepository.findById(request.itemId())
                                .switchIfEmpty(Mono.error(new RuntimeException("Item not found")))


                                 .flatMap(itemEntity ->
                                            categoryRepository.findById(request.categoryId())
                                        .switchIfEmpty(Mono.error(new RuntimeException("Category not found"))))


                                .flatMap(category -> {
                                    CashBookEntity cashBook =
                                            CashBookConvertor.toEntity(request, khataBookId);

                                    return cashBookRepository.save(cashBook);
                                })


                                .map(saved -> new CreateCashBookUseCaseResponse(
                                        saved.getId(),
                                        "Cashbook created successfully"
                                ))
                );
    }
}