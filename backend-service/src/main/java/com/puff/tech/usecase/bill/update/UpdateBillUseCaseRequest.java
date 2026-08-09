package com.puff.tech.usecase.bill.update;

import io.micronaut.serde.annotation.Serdeable;

import java.math.BigDecimal;
import java.time.LocalDate;

@Serdeable
public record UpdateBillUseCaseRequest(
        Integer customerId,
        LocalDate billDate,
        LocalDate dueDate,
        BigDecimal totalAmount,
        BigDecimal paidAmount,
        String status
) {
}
