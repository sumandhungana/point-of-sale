package com.puff.tech.usecase.salesbillitems.get;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

import java.math.BigDecimal;
import java.time.Instant;


@Serdeable
public record GetSalesBillItemUseCaseResponse(
        Integer id,
        Integer salesBillId,
        Integer itemId,
        BigDecimal quantity,
        BigDecimal unitPrice,
        BigDecimal totalPrice,
        BigDecimal discount,
        BigDecimal tax,
        BigDecimal finalPrice,
        Instant createdAt,
        Instant updatedAt
)
implements UseCase.UseCaseResponse {
}


