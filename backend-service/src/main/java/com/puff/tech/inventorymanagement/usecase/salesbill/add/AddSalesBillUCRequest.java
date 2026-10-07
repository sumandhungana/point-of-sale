package com.puff.tech.inventorymanagement.usecase.salesbill.add;

import com.puff.tech.core.usecases.UCRequest;
import io.micronaut.serde.annotation.Serdeable;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Serdeable
public record AddSalesBillUCRequest(
        String billNumber,
        LocalDate billDate,
        String paymentMode,
        BigDecimal amount,
        String remarks,
        String photoPath,
        Long customerId,
        String customerName,
        List<SalesBillItemRequest> items,
        Long id
) implements UCRequest {
    @Serdeable
    public record SalesBillItemRequest(
            Long itemId,
            String name,
            String unit,
            Double availableStock,
            Double quantity,
            BigDecimal unitPrice,
            Double taxPercentage,
            Double vatPercentage,
            BigDecimal taxAmount,
            BigDecimal vatAmount,
            BigDecimal totalPrice
    ) {
    }
}