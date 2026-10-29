package com.puff.tech.inventorymanagement.usecase.purchasebill.getsingle;

import com.puff.tech.core.usecases.UCResponse;
import io.micronaut.serde.annotation.Serdeable;

import java.math.BigDecimal;
import java.time.LocalDate;

@Serdeable
public record GetSinglePurchaseBillUCResponse(
        Integer id,
        String purchaseNo,
        LocalDate date,
        BigDecimal amount,
        String paymentMode,
        String paymentStatus,
        String remarks,
        String photoPath,
        GetSinglePurchaseBillUCResponse.CategoryDto category,
        GetSinglePurchaseBillUCResponse.ItemDto item
) implements UCResponse {
    @Serdeable
    public record CategoryDto(String name) {
    }

    @Serdeable
    public record ItemDto(String name, String imageUrl) {
    }
}
