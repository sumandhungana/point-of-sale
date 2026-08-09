package com.puff.tech.usecase.cashbook.update;

import com.puff.tech.core.utils.HelperUtils;
import com.puff.tech.covertor.CashBookConvertor;
import com.puff.tech.entity.CashBookEntity;
import com.puff.tech.repository.CashBookRepository;
import com.puff.tech.repository.CategoryRepository;
import com.puff.tech.repository.ItemRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

@Singleton
public class UpdateCashBookUseCase {

    private final CashBookRepository cashBookRepository;
    private final CategoryRepository categoryRepository;
    private final ItemRepository itemRepository;
    private final HelperUtils helperUtils;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public UpdateCashBookUseCase(CashBookRepository cashBookRepository,
                                 CategoryRepository categoryRepository,
                                 ItemRepository itemRepository,
                                 HelperUtils helperUtils,
                                 KhataBookImplementation khataBookImplementation) {
        this.cashBookRepository = cashBookRepository;
        this.categoryRepository = categoryRepository;
        this.itemRepository = itemRepository;
        this.helperUtils = helperUtils;
        this.khataBookImplementation = khataBookImplementation;
    }

    public Mono<UpdateCashBookUseCaseResponse> execute(Integer id, UpdateCashBookUseCaseRequest request) {

        return khataBookImplementation.getCurrentKhataBookId()
                .flatMap(khataBookId ->

                        cashBookRepository.findByIdAndKhataBookId(id, khataBookId)
                                .switchIfEmpty(Mono.error(new RuntimeException("Cashbook not found")))


                                .flatMap(existing ->
                                        itemRepository.findById(Math.toIntExact(request.itemId()))
                                                .switchIfEmpty(Mono.error(new RuntimeException("Item not found")))
                                                .thenReturn(existing)
                                )


                                .flatMap(existing ->
                                        categoryRepository.findById(Math.toIntExact(request.categoryId()))
                                                .switchIfEmpty(Mono.error(new RuntimeException("Category not found")))
                                                .thenReturn(existing)
                                )
                                .flatMap(existing->{
                                    var updated= CashBookConvertor.updateEntity(existing,request);
                                    return cashBookRepository.update(updated)
                                            .map(cashBookEntity -> new UpdateCashBookUseCaseResponse(" Cashbook Updated successfully"));
                                })





                );
    }
}