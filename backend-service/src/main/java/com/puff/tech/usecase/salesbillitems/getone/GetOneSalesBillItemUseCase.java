package com.puff.tech.usecase.salesbillitems.getone;

import com.puff.tech.core.usecases.UseCase;
import com.puff.tech.covertor.SalesBillItemConvertor;
import com.puff.tech.repository.SalesBillItemRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import com.puff.tech.usecase.salesbillitems.get.GetSalesBillItemUseCaseResponse;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class GetOneSalesBillItemUseCase implements UseCase<GetOneSalesBillItemUseCaseRequest, GetSalesBillItemUseCaseResponse> {

    private final SalesBillItemRepository salesBillItemRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public GetOneSalesBillItemUseCase(SalesBillItemRepository salesBillItemRepository,
                                      KhataBookImplementation khataBookImplementation) {
        this.salesBillItemRepository = salesBillItemRepository;
        this.khataBookImplementation = khataBookImplementation;
    }

    @Override
    public Mono<GetSalesBillItemUseCaseResponse> execute(GetOneSalesBillItemUseCaseRequest request) {
        return khataBookImplementation.getCurrentKhataBookId()
                .flatMap(khataBookId->salesBillItemRepository.findByIdAndKhataBookId(request.id(), khataBookId)
                        .map(SalesBillItemConvertor::toResponse)
                        .onErrorResume(err->Mono.error(new RuntimeException("Unexpected happened" +err.getLocalizedMessage()))));
    }
}
