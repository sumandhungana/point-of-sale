package com.puff.tech.usecase.payment.update;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

import java.math.BigDecimal;
import java.time.LocalDate;

@Serdeable
public record UpdatePaymentUseCaseRequest(
        Integer id,
        BigDecimal amount,
        String notes,
        LocalDate paymentDate,
        String paymentMode
) implements UseCases.UseCaseRequest {
}
