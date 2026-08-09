package com.puff.tech.usecase.payment.getbydaterange;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.http.annotation.QueryValue;
import io.micronaut.serde.annotation.Serdeable;

import java.time.LocalDate;

@Serdeable
public record GetPaymentByDateRangeUseCaseRequest(
        @QueryValue
        LocalDate startDate,

        @QueryValue
        LocalDate endDate
)
implements UseCase.UseCaseRequest {
}
