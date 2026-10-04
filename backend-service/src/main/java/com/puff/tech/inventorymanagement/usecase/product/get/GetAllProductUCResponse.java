package com.puff.tech.inventorymanagement.usecase.product.get;

import com.puff.tech.core.usecases.UCResponse;
import io.micronaut.serde.annotation.Serdeable;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Serdeable
public record GetAllProductUCResponse(
        List<ItemDto> items,
        BigDecimal totalSalesPrice,
        Long totalItems
) implements UCResponse {

    @Serdeable
    public record ItemDto(
            Long id,
            String name,
            Double itemCount,
            String unit,
            BigDecimal salesPrice,
            BigDecimal perUnitPurchasePrice,
            BigDecimal grossPurchasePrice,
            Double openingStock,
            String imageUrl,
            CategoryDto category,
            Instant createdAt,
            Instant updatedAt,
            String createdBy,
            String updatedBy
    ) {}

    @Serdeable
    public record CategoryDto(
            Long id,
            String name
    ) {}
}
