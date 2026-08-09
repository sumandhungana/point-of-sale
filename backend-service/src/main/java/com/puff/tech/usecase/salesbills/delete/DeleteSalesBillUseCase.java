package com.puff.tech.usecase.salesbills.delete;

import com.puff.tech.core.usecases.UseCase;
import com.puff.tech.repository.SalesBillRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class DeleteSalesBillUseCase implements UseCase<DeleteSalesBillUseCaseRequest,DeleteSalesBillUseCaseResponse> {

    private final SalesBillRepository salesBillRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public DeleteSalesBillUseCase(SalesBillRepository salesBillRepository,
                                  KhataBookImplementation khataBookImplementation) {
        this.salesBillRepository = salesBillRepository;
        this.khataBookImplementation = khataBookImplementation;
    }

    @Override
    public Mono<DeleteSalesBillUseCaseResponse> execute(DeleteSalesBillUseCaseRequest request) {
        return khataBookImplementation.getCurrentKhataBookId()
                .flatMap(khataBookId->
                        salesBillRepository.findByIdAndKhataBookId(request.id(), khataBookId)
                                .switchIfEmpty(Mono.error(new RuntimeException("Sales bill not found")))
                                .flatMap(salesBillEntity -> {
                                    return salesBillRepository.deleteById(request.id())
                                            .then(Mono.just(new DeleteSalesBillUseCaseResponse("Sales bill deleted")));
                                }));
    }
}
