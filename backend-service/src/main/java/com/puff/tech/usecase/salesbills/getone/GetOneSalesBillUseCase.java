package com.puff.tech.usecase.salesbills.getone;

import com.puff.tech.core.usecases.UseCase;
import com.puff.tech.covertor.SalesBillConvertor;
import com.puff.tech.repository.SalesBillRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import com.puff.tech.usecase.salesbills.get.GetSalesBillUseCaseResponse;
import jakarta.inject.Inject;
import reactor.core.publisher.Mono;

public class GetOneSalesBillUseCase implements UseCase<GetOneSalesBillUseCaseRequest, GetSalesBillUseCaseResponse> {

    private final SalesBillRepository salesBillRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public GetOneSalesBillUseCase(SalesBillRepository salesBillRepository,
                                  KhataBookImplementation khataBookImplementation) {
        this.salesBillRepository = salesBillRepository;
        this.khataBookImplementation = khataBookImplementation;
    }

    @Override
    public Mono<GetSalesBillUseCaseResponse> execute(GetOneSalesBillUseCaseRequest request) {
        return khataBookImplementation.getCurrentKhataBookId()
                .flatMap(khataBookId->
                        salesBillRepository.findByIdAndKhataBookId(request.id(), khataBookId)
                                .map(SalesBillConvertor::toResponse)
                                .onErrorResume(err->Mono.error(new RuntimeException("Unexpected happened" +err.getLocalizedMessage()))));
    }
}
