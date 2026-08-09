package com.puff.tech.usecase.salesbillitems.delete;

import com.puff.tech.core.usecases.UseCase;
import com.puff.tech.entity.SalesBillEntity;
import com.puff.tech.repository.SalesBillItemRepository;
import com.puff.tech.repository.SalesBillRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class DeleteSalesBillItemUseCase implements UseCase<DeleteSalesBillItemUseCaseRequest,DeleteSalesBillItemUseCaseResponse> {

    private final SalesBillRepository salesBillRepository;
    private final SalesBillItemRepository salesBillItemRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public DeleteSalesBillItemUseCase(SalesBillRepository salesBillRepository,
                                      SalesBillItemRepository salesBillItemRepository,
                                      KhataBookImplementation khataBookImplementation) {
        this.salesBillRepository = salesBillRepository;
        this.salesBillItemRepository = salesBillItemRepository;
        this.khataBookImplementation = khataBookImplementation;
    }

    @Override
    public Mono<DeleteSalesBillItemUseCaseResponse> execute(DeleteSalesBillItemUseCaseRequest request) {
        return khataBookImplementation.getCurrentKhataBookId()
                .flatMap(khataBookId-> salesBillItemRepository.findByIdAndKhataBookId(request.id(), khataBookId)
                        .switchIfEmpty(Mono.error(new RuntimeException("Sales bill item not found")))
                        .flatMap(salesBillItemEntity -> {
                            return salesBillItemRepository.deleteById(request.id())
                                    .then(salesBillRepository.findById(salesBillItemEntity.getSalesBillId())
                                            .flatMap(this::updateSalesBillAmount))
                                    .thenReturn(new DeleteSalesBillItemUseCaseResponse("Sales bill item deleted"));
                        }));
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
