package com.puff.tech.usecase.payment.create;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

import java.math.BigDecimal;
import java.time.LocalDate;

@Serdeable
public record CreatePaymentUseCaseRequest(
         BigDecimal amount,
         String notes,
         LocalDate paymentDate,
         String paymentMode
)
implements UseCase.UseCaseRequest {
}
