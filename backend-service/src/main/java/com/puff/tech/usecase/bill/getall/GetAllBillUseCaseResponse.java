package com.puff.tech.usecase.bill.getall;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Serdeable
public record GetAllBillUseCaseResponse(
        Long billId,
        Long customerId,
        LocalDate billDate,
        LocalDate dueDate,
        BigDecimal totalAmount,
        BigDecimal paidAmount,
        String status,
        Instant createdAt,
        Instant updatedAt
)
implements UseCases.UseCaseResponse {
}
