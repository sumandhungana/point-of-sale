package com.puff.tech.usecase.bill.getall;

import com.puff.tech.covertor.BillConvertor;
import com.puff.tech.repository.BillRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Flux;

@Singleton
public class GetAllBillUseCase {

    private final BillRepository billRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public GetAllBillUseCase(BillRepository billRepository, KhataBookImplementation khataBookImplementation) {
        this.billRepository = billRepository;
        this.khataBookImplementation = khataBookImplementation;
    }

    public Flux<GetAllBillUseCaseResponse> execute(){
        return billRepository.findByKhataBookIdOrderByCreatedAtDesc(khataBookImplementation.getCurrentKhataBookId())
                .map(BillConvertor::toResponse);
    }
}
