package com.puff.tech.inventorymanagement.usecase.salesbill.getall;

import com.puff.tech.core.usecases.UCResponse;
import io.micronaut.serde.annotation.Serdeable;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Serdeable
@Builder
public record GetAllSalesBillUCResponse(
         Long id,
         String billNumber,
          LocalDate billDate,
         Long customerId,
         String customerName,
         Long productId,
         String productName,
         Double quantity,
         BigDecimal unitPrice,
         Double taxPercentage,
         Double vatPercentage,
         BigDecimal taxAmount,
         BigDecimal vatAmount,
         BigDecimal amount,
         String paymentMode,
         String remarks,
         String photoPath,
         Instant createdAt,
         String createdBy,
         Instant updatedAt,
         String updatedBy

) implements UCResponse {
}
