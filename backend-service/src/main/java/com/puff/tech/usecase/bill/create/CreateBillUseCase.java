package com.puff.tech.usecase.bill.create;

import com.puff.tech.core.usecases.UseCases;
import com.puff.tech.covertor.BillConvertor;
import com.puff.tech.repository.BillRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class CreateBillUseCase implements UseCases<CreateBillUseCaseRequest,CreateBillUseCaseResponse> {


    private final BillRepository billRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public CreateBillUseCase(BillRepository billRepository, KhataBookImplementation khataBookImplementation) {
        this.billRepository = billRepository;
        this.khataBookImplementation = khataBookImplementation;
    }

    @Override
    public Mono<CreateBillUseCaseResponse> execute(CreateBillUseCaseRequest request) {
        var bill= BillConvertor.toEntity(request, khataBookImplementation.getCurrentKhataBookId().block());
        return billRepository.save(bill)
                .map(billData->new CreateBillUseCaseResponse("Bill created successfully"))
                .onErrorResume(err->Mono.error(new Throwable("Unexpected happened while creating bill")));
    }
}
