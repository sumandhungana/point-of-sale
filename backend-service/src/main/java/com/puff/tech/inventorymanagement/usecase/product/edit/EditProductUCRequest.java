package com.puff.tech.inventorymanagement.usecase.product.edit;

import com.puff.tech.core.usecases.UCRequest;
import io.micronaut.core.annotation.Nullable;
import io.micronaut.serde.annotation.Serdeable;

import java.math.BigDecimal;

@Serdeable
public record EditProductUCRequest(
        long itemId,
        String name,
        Long categoryId,
        Double itemCount,
        String unit,
        BigDecimal perUnitPurchasePrice,
        BigDecimal grossPurchasePrice,
        BigDecimal fixedSellingPrice,
        @Nullable
        Boolean isTaxIncluded,
        Double lowStockAlert,
        @Nullable
        Double vatPercentage,
        Double taxPercentage,
        String imageUrl
) implements UCRequest {
}
