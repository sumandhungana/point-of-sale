package com.puff.tech.usecase.salesbillitems.get;

import com.puff.tech.covertor.SalesBillItemConvertor;
import com.puff.tech.repository.SalesBillItemRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Flux;

@Singleton
public class GetSalesBillItemUseCase {

    private final SalesBillItemRepository salesBillItemRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public GetSalesBillItemUseCase(SalesBillItemRepository salesBillItemRepository,
                                   KhataBookImplementation khataBookImplementation) {
        this.salesBillItemRepository = salesBillItemRepository;
        this.khataBookImplementation = khataBookImplementation;
    }

    public Flux<GetSalesBillItemUseCaseResponse> execute(){
        return khataBookImplementation.getCurrentKhataBookId()
                .flatMapMany(khataBookId->
                        salesBillItemRepository.findByKhataBookIdOrderByCreatedAtDesc(khataBookId)
                                .map(SalesBillItemConvertor::toResponse)
                                .onErrorResume(err->Flux.error(new RuntimeException("Unexpected happened" +new RuntimeException()))));
    }

}
