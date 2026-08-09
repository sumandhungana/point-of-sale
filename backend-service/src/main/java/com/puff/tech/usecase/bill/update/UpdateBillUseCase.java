package com.puff.tech.usecase.bill.update;


import com.puff.tech.repository.BillRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

import java.time.Instant;

@Singleton
public class UpdateBillUseCase {

    private final BillRepository billRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public UpdateBillUseCase(BillRepository billRepository,
                             KhataBookImplementation khataBookImplementation) {
        this.billRepository = billRepository;
        this.khataBookImplementation = khataBookImplementation;
    }

    public Mono<UpdateBillUseCaseResponse> execute(Long id, UpdateBillUseCaseRequest request) {

        return khataBookImplementation.getCurrentKhataBookId()
                .flatMap(khataBookId ->
                        billRepository.findByBillIdAndKhataBookId(Math.toIntExact(id), Math.toIntExact(Long.valueOf(khataBookId)))
                                .switchIfEmpty(Mono.error(new RuntimeException("Bill not found")))
                                .flatMap(existingBill -> {


                                    if (request.customerId() != null)
                                        existingBill.setCustomerId(Long.valueOf(request.customerId()));

                                    if (request.billDate() != null)
                                        existingBill.setBillDate(request.billDate());

                                    if (request.dueDate() != null)
                                        existingBill.setDueDate(request.dueDate());

                                    if (request.totalAmount() != null)
                                        existingBill.setTotalAmount(request.totalAmount());

                                    if (request.paidAmount() != null)
                                        existingBill.setPaidAmount(request.paidAmount());

                                    if (request.status() != null && !request.status().isEmpty())
                                        existingBill.setStatus(request.status());

                                    existingBill.setUpdatedAt(Instant.now());

                                    return billRepository.update(existingBill);
                                })
                                .map(updated -> new UpdateBillUseCaseResponse("Bill updated successfully"))
                );
    }
}