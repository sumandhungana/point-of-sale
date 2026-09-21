package com.puff.tech.usecase.rentalitem.get;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Serdeable
public record GetRentalItemUseCaseResponse(
        Integer id,
        String rentalItemName,
        String phoneNumber,
        String address,
        BigDecimal rentalAmount,
        String rentalPeriod,
        LocalDate startDate,
        LocalDate endDate,
        String remarks,
        Instant createdAt,
        Instant updatedAt
)implements UseCases.UseCaseResponse {
}
