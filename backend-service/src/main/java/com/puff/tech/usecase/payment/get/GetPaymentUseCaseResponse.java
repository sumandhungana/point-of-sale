package com.puff.tech.usecase.payment.get;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Serdeable
public record GetPaymentUseCaseResponse(
        Integer id,
        BigDecimal amount,
        String note,
        LocalDate paymentDate,
        String paymentMode,
        Instant createdAt
)
implements UseCase.UseCaseResponse {
}
