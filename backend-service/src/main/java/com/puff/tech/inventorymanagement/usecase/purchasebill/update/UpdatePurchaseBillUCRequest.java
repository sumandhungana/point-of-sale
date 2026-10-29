package com.puff.tech.inventorymanagement.usecase.purchasebill.update;

import com.puff.tech.core.usecases.UCRequest;
import io.micronaut.serde.annotation.Serdeable;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Serdeable
public record UpdatePurchaseBillUCRequest(
        Integer id,
        String purchaseNo,
        LocalDate purchaseDate,
        String paymentMode,
        String paymentStatus,
        Long supplierId,
        String remarks,
        String photoPath,
        List<PurchaseItemDto> items
) implements UCRequest {

    @Serdeable
    public record PurchaseItemDto(
            Long productId,
            Double itemCount,
            BigDecimal perUnitPurchasePrice
    ) {}
}
