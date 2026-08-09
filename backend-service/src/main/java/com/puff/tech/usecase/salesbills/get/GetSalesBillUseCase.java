package com.puff.tech.usecase.salesbills.get;

import com.puff.tech.covertor.SalesBillConvertor;
import com.puff.tech.repository.SalesBillRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Flux;

@Singleton
public class GetSalesBillUseCase {

    private final SalesBillRepository salesBillRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public GetSalesBillUseCase(SalesBillRepository salesBillRepository
            , KhataBookImplementation khataBookImplementation) {
        this.salesBillRepository = salesBillRepository;
        this.khataBookImplementation = khataBookImplementation;
    }

    public Flux<GetSalesBillUseCaseResponse> execute(){
        return khataBookImplementation.getCurrentKhataBookId()
                .flatMapMany(khataBookId->
                        salesBillRepository.findByKhataBookIdOrderByCreatedAtDesc(khataBookId)
                                .map(SalesBillConvertor::toResponse)
                                .onErrorResume(err->Flux.error(new RuntimeException("Unexpected happened" +err.getLocalizedMessage()))));
    }
}
