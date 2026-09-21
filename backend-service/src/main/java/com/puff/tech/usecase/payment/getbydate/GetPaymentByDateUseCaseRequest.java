package com.puff.tech.usecase.payment.getbydate;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

import java.time.LocalDate;

@Serdeable
public record GetPaymentByDateUseCaseRequest(
        LocalDate date
)
implements UseCases.UseCaseRequest {
}
