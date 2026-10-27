package com.puff.tech.inventorymanagement.usecase.product.get;

import com.puff.tech.core.usecases.UCResponse;
import io.micronaut.serde.annotation.Serdeable;

import java.math.BigDecimal;
import java.time.Instant;

@Serdeable
public record GetProductByIdUCResponse(
        Long id,
        String name,
        Double itemCount,
        String unit,
        BigDecimal fixedSellingPrice,
        BigDecimal perUnitPurchasePrice,
        BigDecimal grossPurchasePrice,
        BigDecimal totalSalesAmount,
        Double taxPercentage,
        Double vatPercentage,
        String imageUrl,
        GetAllProductUCResponse.CategoryDto category,
        Long lowStockAlert,
        Instant createdAt,
        Instant updatedAt,
        String createdBy,
        String updatedBy
) implements UCResponse {
}
