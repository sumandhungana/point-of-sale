package com.puff.tech.inventorymanagement.usecase.salesbill.update;

import com.puff.tech.core.usecases.MonoUC;
import com.puff.tech.customermanagement.repository.OrganizationCustomerEntity;
import com.puff.tech.inventorymanagement.repository.SalesBillEntity;
import com.puff.tech.inventorymanagement.repository.SalesBillRepository;
import com.puff.tech.security.UseCaseContext;
import io.micronaut.transaction.annotation.Transactional;
import jakarta.inject.Singleton;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Singleton
public class UpdateSalesBillUC implements MonoUC<UpdateSalesBillUCRequest, UpdateSalesBillUCResponse> {

    private final SalesBillRepository salesBillRepository;

    public UpdateSalesBillUC(SalesBillRepository salesBillRepository) {
        this.salesBillRepository = salesBillRepository;
    }

    @Override
    @Transactional
    public Mono<UpdateSalesBillUCResponse> execute(UpdateSalesBillUCRequest request, UseCaseContext context) {
        Long memberId = context.securityContext().memberId();

        if ((request.id() == null || request.id() <= 0) && (request.billNumber() == null || request.billNumber().isBlank())) {
            return Mono.error(new IllegalArgumentException("Either bill ID or billNumber is required for update."));
        }

        // Find primary record
        Mono<SalesBillEntity> findBillMono = (request.id() != null && request.id() > 0)
                ? salesBillRepository.findByIdAndMemberId(request.id(), memberId)
                : salesBillRepository.findByBillNumberAndMemberId(request.billNumber(), memberId).next();

        return findBillMono
                .switchIfEmpty(Mono.error(new RuntimeException("Sales bill not found for update")))
                .flatMap(existingEntity -> {
                    String billNumberToUpdate = existingEntity.getBillNumber();

                    // Update all line items under this billNumber so paymentStatus, paymentMode, remarks, etc. stay synchronized
                    Flux<SalesBillEntity> billsToUpdateFlux = (billNumberToUpdate != null && !billNumberToUpdate.isBlank())
                            ? salesBillRepository.findByBillNumberAndMemberId(billNumberToUpdate, memberId)
                            : Flux.just(existingEntity);

                    return billsToUpdateFlux
                            .flatMap(entity -> {
                                if (request.paymentMode() != null && !request.paymentMode().isBlank()) {
                                    entity.setPaymentMode(request.paymentMode());
                                }
                                if (request.paymentStatus() != null && !request.paymentStatus().isBlank()) {
                                    entity.setPaymentStatus(request.paymentStatus());
                                }
                                if (request.remarks() != null) {
                                    entity.setRemarks(request.remarks());
                                }
                                if (request.photoPath() != null) {
                                    entity.setPhotoPath(request.photoPath());
                                }
                                if (request.billDate() != null) {
                                    entity.setBillDate(request.billDate());
                                }
                                if (request.customerId() != null && request.customerId() > 0) {
                                    OrganizationCustomerEntity customer = new OrganizationCustomerEntity();
                                    customer.setId(Math.toIntExact(request.customerId()));
                                    entity.setCustomer(customer);
                                    if (request.customerName() != null && !request.customerName().isBlank()) {
                                        entity.setCustomerName(request.customerName());
                                    }
                                } else if (request.customerName() != null && !request.customerName().isBlank()) {
                                    entity.setCustomerName(request.customerName());
                                }

                                entity.setUpdatedBy(context.securityContext().subject());
                                return salesBillRepository.update(entity);
                            })
                            .collectList()
                            .map(updatedList -> new UpdateSalesBillUCResponse(
                                    existingEntity.getId() != null ? existingEntity.getId().toString() : "",
                                    "Sales bill updated successfully."
                            ));
                });
    }
}
