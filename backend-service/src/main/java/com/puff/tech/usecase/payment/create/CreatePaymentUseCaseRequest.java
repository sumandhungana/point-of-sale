package com.puff.tech.usecase.payment.create;

import com.puff.tech.core.usecases.UseCases;
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
implements UseCases.UseCaseRequest {
}
