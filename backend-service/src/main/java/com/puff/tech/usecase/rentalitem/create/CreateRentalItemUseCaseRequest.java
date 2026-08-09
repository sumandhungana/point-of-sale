package com.puff.tech.usecase.rentalitem.create;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

import java.math.BigDecimal;
import java.time.LocalDate;

@Serdeable
public record CreateRentalItemUseCaseRequest(
        String rentalItemName,
        String phoneNumber,
        String address,
        BigDecimal rentalAmount,
        String rentalPeriod,
        LocalDate startDate,
        LocalDate endDate,
        String remarks
) implements UseCase.UseCaseRequest {
}
