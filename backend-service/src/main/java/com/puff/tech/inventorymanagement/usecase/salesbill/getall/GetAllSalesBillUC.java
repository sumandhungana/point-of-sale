package com.puff.tech.inventorymanagement.usecase.salesbill.getall;

import com.puff.tech.core.usecases.FluxUC;
import com.puff.tech.inventorymanagement.repository.SalesBillEntity;
import com.puff.tech.inventorymanagement.repository.SalesBillRepository;
import com.puff.tech.security.UseCaseContext;
import io.micronaut.transaction.annotation.Transactional;
import jakarta.inject.Singleton;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Singleton
public class GetAllSalesBillUC implements FluxUC<GetAllSalesBillUCRequest, GetAllSalesBillUCResponse> {

    private final SalesBillRepository salesBillRepository;

    public GetAllSalesBillUC(SalesBillRepository salesBillRepository) {
        this.salesBillRepository = salesBillRepository;
    }

    @Override
    @Transactional
    public Flux<GetAllSalesBillUCResponse> execute(GetAllSalesBillUCRequest request, UseCaseContext context) {
        Long memberId = context.securityContext().memberId();
        return this.salesBillRepository.findByMemberId(memberId)
                .map(this::prepareSalesBillResponse);
    }

    private GetAllSalesBillUCResponse prepareSalesBillResponse(SalesBillEntity entity) {
        // Resolve customer name safely for walk-in or registered customers
        String customerName = "Walk-in Customer";
        Long customerId = null;

        if (entity.getCustomer() != null) {
            customerId = (long) entity.getCustomer().getId();
            customerName = entity.getCustomer().getName();
        } else if (entity.getCustomerName() != null && !entity.getCustomerName().isBlank()) {
            customerName = entity.getCustomerName();
        }

        // Resolve product name and ID
        String productName = entity.getProduct() != null ? entity.getProduct().getName() : "N/A";
        Long productId = entity.getProduct() != null ? entity.getProduct().getId() : null;

        return GetAllSalesBillUCResponse.builder()
                .id(entity.getId())
                .billNumber(entity.getBillNumber())
                .billDate(entity.getBillDate())
                .customerId(customerId)
                .customerName(customerName)
                .productId(productId)
                .productName(productName)
                .quantity(entity.getQuantity())
                .unitPrice(entity.getUnitPrice())
                .taxPercentage(entity.getTaxPercentage())
                .vatPercentage(entity.getVatPercentage())
                .taxAmount(entity.getTaxAmount())
                .vatAmount(entity.getVatAmount())
                .amount(entity.getAmount())
                .paymentMode(entity.getPaymentMode())
                .remarks(entity.getRemarks())
                .photoPath(entity.getPhotoPath())
                .createdAt(entity.getCreatedAt())
                .createdBy(entity.getCreatedBy())
                .updatedAt(entity.getUpdatedAt())
                .updatedBy(entity.getUpdatedBy())
                .build();
    }
}
