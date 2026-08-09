package com.puff.tech.usecase.bill.create;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

import java.math.BigDecimal;
import java.time.LocalDate;

@Serdeable
public record CreateBillUseCaseRequest(
        Integer customerId,
        LocalDate billDate,
        LocalDate dueDate,
        BigDecimal totalAmount,
        BigDecimal paidAmount,
        String status
)
implements UseCase.UseCaseRequest{
}
