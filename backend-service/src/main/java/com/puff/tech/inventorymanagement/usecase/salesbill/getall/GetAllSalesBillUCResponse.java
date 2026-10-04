package com.puff.tech.inventorymanagement.usecase.salesbill.getall;

import com.puff.tech.core.usecases.UCResponse;
import io.micronaut.serde.annotation.Serdeable;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.Instant;

@Serdeable
@Builder
public record GetAllSalesBillUCResponse(
        Long id,
        String billNumber,
        String productName,
        String customerName,
        BigDecimal billAmount,
        String paymentMode,
        String remarks,
        String createdBy,
        Instant createdAt,
        String updatedBy,
        Instant updatedAt

) implements UCResponse {
}
