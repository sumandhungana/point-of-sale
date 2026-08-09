package com.puff.tech.usecase.salesbillitems.create;

import com.puff.tech.core.usecases.UseCase;
import com.puff.tech.covertor.SalesBillItemConvertor;
import com.puff.tech.entity.ItemEntity;
import com.puff.tech.entity.SalesBillEntity;
import com.puff.tech.entity.SalesBillItemEntity;
import com.puff.tech.repository.ItemRepository;
import com.puff.tech.repository.SalesBillItemRepository;
import com.puff.tech.repository.SalesBillRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class CreateSalesBillItemUseCase implements UseCase<CreateSalesBillItemUseCaseRequest,CreateSalesBillItemUseCaseResponse> {

    private final SalesBillItemRepository salesBillItemRepository;
    private final SalesBillRepository salesBillRepository;
    private final ItemRepository itemRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public CreateSalesBillItemUseCase(SalesBillItemRepository salesBillItemRepository,
                                      SalesBillRepository salesBillRepository,
                                      ItemRepository itemRepository,
                                      KhataBookImplementation khataBookImplementation) {
        this.salesBillItemRepository = salesBillItemRepository;
        this.salesBillRepository = salesBillRepository;
        this.itemRepository = itemRepository;
        this.khataBookImplementation = khataBookImplementation;
    }

    @Override
    public Mono<CreateSalesBillItemUseCaseResponse> execute(
            CreateSalesBillItemUseCaseRequest request
    ) {

        return khataBookImplementation.getCurrentKhataBookId()
                .flatMap(khataBookId ->

                        salesBillRepository.findById(request.salesBillId())
                                .switchIfEmpty(
                                        Mono.error(
                                                new RuntimeException("Sales bill not found")
                                        )
                                )

                                .flatMap(salesBillEntity ->

                                        itemRepository.findById(request.itemId())
                                                .switchIfEmpty(
                                                        Mono.error(
                                                                new RuntimeException("Item not found")
                                                        )
                                                )

                                                .flatMap(itemEntity -> {

                                                    SalesBillItemEntity salesBillItem =
                                                            SalesBillItemConvertor
                                                                    .toEntity(
                                                                            request,
                                                                            khataBookId
                                                                    );

                                                    salesBillItem.setSalesBill(
                                                            salesBillEntity
                                                    );

                                                    salesBillItem.setItem(
                                                            itemEntity
                                                    );

                                                    return salesBillItemRepository
                                                            .save(salesBillItem)
                                                            .flatMap(saved ->

                                                                    updateSalesBillAmount(
                                                                            salesBillEntity
                                                                    ).thenReturn(saved)
                                                            );
                                                })
                                )
                )
                .map(salesBillItemEntity -> new CreateSalesBillItemUseCaseResponse("Sales bill created"));
    }

    private Mono<SalesBillEntity> updateSalesBillAmount(
            SalesBillEntity salesBill
    ) {

        return salesBillItemRepository
                .calculateBillTotal(salesBill.getId())
                .flatMap(total -> {

                    salesBill.setAmount(total);

                    return salesBillRepository.update(salesBill);
                });
    }
}
