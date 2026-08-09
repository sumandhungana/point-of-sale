package com.puff.tech.usecase.salesbills.update;

import com.puff.tech.core.usecases.UseCase;
import com.puff.tech.covertor.SalesBillConvertor;
import com.puff.tech.repository.SalesBillRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class UpdateSalesBillUseCase implements UseCase<UpdateSalesBillUseCaseRequest, UpdateSalesBillUseCaseResponse> {

    private final SalesBillRepository salesBillRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public UpdateSalesBillUseCase(SalesBillRepository salesBillRepository,
                                  KhataBookImplementation khataBookImplementation) {
        this.salesBillRepository = salesBillRepository;
        this.khataBookImplementation = khataBookImplementation;
    }

    @Override
    public Mono<UpdateSalesBillUseCaseResponse> execute(UpdateSalesBillUseCaseRequest request) {
        return khataBookImplementation.getCurrentKhataBookId()
                .flatMap(khataBookId->
                        salesBillRepository.findByIdAndKhataBookId(request.id(), khataBookId))
                .switchIfEmpty(Mono.error(new RuntimeException("Sales bill not found")))
                .flatMap(salesBillEntity -> {
                    var updated= SalesBillConvertor.toEntityUpdate(request,salesBillEntity);
                    return salesBillRepository.update(updated)
                            .map(salesBillEntity1 -> new UpdateSalesBillUseCaseResponse("Sales bill updated"))
                            .onErrorResume(err->Mono.error(new RuntimeException("Unexpected happened")));
                });
    }
}
