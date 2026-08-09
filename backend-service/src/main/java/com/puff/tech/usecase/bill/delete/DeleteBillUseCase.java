package com.puff.tech.usecase.bill.delete;

import com.puff.tech.repository.BillRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class DeleteBillUseCase {

    private final BillRepository billRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public DeleteBillUseCase(BillRepository billRepository,
                             KhataBookImplementation khataBookImplementation) {
        this.billRepository = billRepository;
        this.khataBookImplementation = khataBookImplementation;
    }

    public Mono<DeleteBillUseCaseResponse> execute(Long id) {

        return khataBookImplementation.getCurrentKhataBookId()
                .flatMap(khataBookId ->
                        billRepository.findByBillIdAndKhataBookId(Math.toIntExact(id), Math.toIntExact(Long.valueOf(khataBookId)))
                                .switchIfEmpty(Mono.error(new RuntimeException("Bill not found")))
                                .flatMap(bill ->
                                        billRepository.delete(bill)
                                                .thenReturn(new DeleteBillUseCaseResponse("Bill deleted successfully"))
                                )
                );
    }
}