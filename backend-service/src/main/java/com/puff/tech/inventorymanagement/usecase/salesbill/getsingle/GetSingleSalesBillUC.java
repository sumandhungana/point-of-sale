package com.puff.tech.inventorymanagement.usecase.salesbill.getsingle;

import com.puff.tech.core.usecases.MonoUC;
import com.puff.tech.inventorymanagement.repository.SalesBillEntity;
import com.puff.tech.inventorymanagement.repository.SalesBillRepository;
import com.puff.tech.security.UseCaseContext;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class GetSingleSalesBillUC implements MonoUC<GetSingleSalesBillUCRequest, GetSingleSalesBillUCResponse> {
    private final SalesBillRepository salesBillRepository;

    public GetSingleSalesBillUC(SalesBillRepository salesBillRepository) {
        this.salesBillRepository = salesBillRepository;
    }

    @Override
    public Mono<GetSingleSalesBillUCResponse> execute(GetSingleSalesBillUCRequest request, UseCaseContext context) {
        Long memberId = context.securityContext().memberId();
        return this.salesBillRepository.findByIdAndMemberId(request.id(), memberId)
                .map(this::prepareSalesBillResponse);
    }

    private GetSingleSalesBillUCResponse prepareSalesBillResponse(SalesBillEntity entity) {
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

        return GetSingleSalesBillUCResponse.builder()
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
                .paymentStatus(entity.getPaymentStatus())
                .remarks(entity.getRemarks())
                .photoPath(entity.getPhotoPath())
                .createdAt(entity.getCreatedAt())
                .createdBy(entity.getCreatedBy())
                .updatedAt(entity.getUpdatedAt())
                .updatedBy(entity.getUpdatedBy())
                .build();
    }
}
