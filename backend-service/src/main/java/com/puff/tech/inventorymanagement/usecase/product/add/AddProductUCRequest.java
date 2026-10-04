package com.puff.tech.inventorymanagement.usecase.product.add;

import com.puff.tech.core.usecases.UCRequest;
import io.micronaut.core.annotation.Nullable;
import io.micronaut.serde.annotation.Serdeable;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDate;

@Builder
@Serdeable
public record AddProductUCRequest(
        String name,
        long categoryId,
        Double itemCount,
        String unit,
        BigDecimal perUnitPurchasePrice,
        BigDecimal grossPurchasePrice,
        @Nullable
        boolean isTaxIncluded,
        double openingStock,
        double lowStockAlert,
        @Nullable
        double vatPercentage,
        @Nullable
        LocalDate vatDate,
        String imageUrl

)
        implements UCRequest {
}

