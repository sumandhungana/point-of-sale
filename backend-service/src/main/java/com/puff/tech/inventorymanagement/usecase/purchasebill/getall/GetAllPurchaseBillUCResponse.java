package com.puff.tech.inventorymanagement.usecase.purchasebill.getall;

import com.puff.tech.core.usecases.UCResponse;
import io.micronaut.serde.annotation.Serdeable;

import java.math.BigDecimal;
import java.time.LocalDate;

@Serdeable
public record GetAllPurchaseBillUCResponse(
        Integer id,
        String purchaseNo,
        LocalDate date,
        BigDecimal amount,
        String paymentMode,
        String remarks,
        String photoPath,
        CategoryDto category,
        ItemDto item
) implements UCResponse {
    @Serdeable
    public record CategoryDto(String name) {
    }

    @Serdeable
    public record ItemDto(String name, String imageUrl) {
    }
}