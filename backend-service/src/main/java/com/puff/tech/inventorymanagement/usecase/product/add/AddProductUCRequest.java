package com.puff.tech.inventorymanagement.usecase.product.add;

import com.puff.tech.core.usecases.UCRequest;
import io.micronaut.core.annotation.Nullable;
import io.micronaut.serde.annotation.Serdeable;
import lombok.Builder;

import java.math.BigDecimal;

@Builder
@Serdeable
public record AddProductUCRequest(

        String name,
        long categoryId,
        Double itemCount,
        String unit,
        BigDecimal perUnitPurchasePrice,
        BigDecimal grossPurchasePrice,
        BigDecimal fixedSellingPrice,
        @Nullable
        boolean isTaxIncluded,
        double lowStockAlert,
        @Nullable
        double vatPercentage,
        double taxPercentage,
        String imageUrl

) implements UCRequest {
}

