package com.puff.tech.usecase.rentalitem.update;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

import java.math.BigDecimal;
import java.time.LocalDate;

@Serdeable
public record UpdateRentalItemUseCaseRequest(
        Integer id,
        String rentalItemName,
        String phoneNumber,
        String address,
        BigDecimal rentalAmount,
        String rentalPeriod,
        LocalDate startDate,
        LocalDate endDate,
        String remarks
)
implements UseCases.UseCaseRequest {
}
