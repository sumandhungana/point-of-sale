package com.puff.tech.usecase.payment.getbydate;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

import java.time.LocalDate;

@Serdeable
public record GetPaymentByDateUseCaseRequest(
        LocalDate date
)
implements UseCase.UseCaseRequest {
}
