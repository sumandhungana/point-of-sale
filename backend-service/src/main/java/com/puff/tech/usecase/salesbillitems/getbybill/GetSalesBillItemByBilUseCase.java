package com.puff.tech.usecase.salesbillitems.getbybill;

import com.puff.tech.covertor.SalesBillItemConvertor;
import com.puff.tech.repository.SalesBillItemRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import com.puff.tech.usecase.salesbillitems.get.GetSalesBillItemUseCaseResponse;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Flux;

@Singleton
public class GetSalesBillItemByBilUseCase {
    private final SalesBillItemRepository salesBillItemRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public GetSalesBillItemByBilUseCase(SalesBillItemRepository salesBillItemRepository,
                                   KhataBookImplementation khataBookImplementation) {
        this.salesBillItemRepository = salesBillItemRepository;
        this.khataBookImplementation = khataBookImplementation;
    }

    public Flux<GetSalesBillItemUseCaseResponse> execute(GetSalesBillItemByBilUseCaseRequest request){
        return khataBookImplementation.getCurrentKhataBookId()
                .flatMapMany(khataBookId->
                        salesBillItemRepository.findBySalesBillIdAndKhataBookId(request.salesBillId(), khataBookId)
                                .map(SalesBillItemConvertor::toResponse)
                                .onErrorResume(err->Flux.error(new RuntimeException("Unexpected happened" +new RuntimeException()))));
    }

}
