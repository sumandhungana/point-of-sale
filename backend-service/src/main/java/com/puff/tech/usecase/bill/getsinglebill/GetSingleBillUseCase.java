package com.puff.tech.usecase.bill.getsinglebill;

import com.puff.tech.covertor.BillConvertor;
import com.puff.tech.repository.BillRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import com.puff.tech.usecase.bill.getall.GetAllBillUseCaseResponse;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class GetSingleBillUseCase {

    private final BillRepository billRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public GetSingleBillUseCase(BillRepository billRepository, KhataBookImplementation khataBookImplementation) {
        this.billRepository = billRepository;
        this.khataBookImplementation = khataBookImplementation;
    }

    public Mono<GetAllBillUseCaseResponse> execute(Long id){
        Long khataBookId= Long.valueOf(khataBookImplementation.getCurrentKhataBookId().block());
        return billRepository.findByBillIdAndKhataBookId(Math.toIntExact(id), Math.toIntExact(khataBookId))
                .map(BillConvertor::toResponse)
                .onErrorResume(err->Mono.error(new Throwable("Unexpected happened")));
    }
}
