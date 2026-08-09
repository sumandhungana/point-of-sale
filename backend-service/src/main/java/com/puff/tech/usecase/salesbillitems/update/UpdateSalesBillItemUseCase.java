package com.puff.tech.usecase.salesbillitems.update;

import com.puff.tech.core.usecases.UseCase;
import com.puff.tech.covertor.SalesBillItemConvertor;
import com.puff.tech.entity.SalesBillEntity;
import com.puff.tech.repository.SalesBillItemRepository;
import com.puff.tech.repository.SalesBillRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class UpdateSalesBillItemUseCase implements UseCase<UpdateSalesBillItemUseCaseRequest,UpdateSalesBillItemUseCaseResponse> {

    private final SalesBillItemRepository salesBillItemRepository;
    private final SalesBillRepository salesBillRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public UpdateSalesBillItemUseCase(SalesBillItemRepository salesBillItemRepository,
                                      SalesBillRepository salesBillRepository,
                                      KhataBookImplementation khataBookImplementation) {
        this.salesBillItemRepository = salesBillItemRepository;
        this.salesBillRepository = salesBillRepository;
        this.khataBookImplementation = khataBookImplementation;
    }

    @Override
    public Mono<UpdateSalesBillItemUseCaseResponse> execute(UpdateSalesBillItemUseCaseRequest request) {

        return khataBookImplementation.getCurrentKhataBookId()
                .flatMap(khataBookId ->

                        salesBillItemRepository
                                .findByIdAndKhataBookId(
                                        request.id(),
                                        khataBookId
                                )
                                .switchIfEmpty(
                                        Mono.error(
                                                new RuntimeException(
                                                        "Sales bill item not found"
                                                )
                                        )
                                )

                                .flatMap(salesBillItemEntity -> {

                                    SalesBillItemConvertor.updateEntity(
                                            salesBillItemEntity,
                                            request
                                    );

                                    return salesBillItemRepository
                                            .update(salesBillItemEntity)
                                            .flatMap(updated ->

                                                    salesBillRepository
                                                            .findById(
                                                                    updated.getSalesBillId()
                                                            )
                                                            .flatMap(
                                                                    this::updateSalesBillAmount
                                                            )
                                                            .thenReturn(updated)
                                            );
                                })
                )
                .map(salesBillItemEntity -> new UpdateSalesBillItemUseCaseResponse("Sales bill item updated successfully"));
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
