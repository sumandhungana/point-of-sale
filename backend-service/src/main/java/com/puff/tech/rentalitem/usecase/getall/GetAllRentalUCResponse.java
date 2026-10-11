package com.puff.tech.rentalitem.usecase.getall;

import com.puff.tech.core.usecases.UCResponse;
import io.micronaut.serde.annotation.Serdeable;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;

@Serdeable
public record GetAllRentalUCResponse(
        Long id,
        String rentalItemName,
        String phoneNumber,
        String address,
        BigDecimal rentalAmount,
        String rentalPeriod,
        LocalDateTime startDate,
        LocalDateTime endDate,
        String remarks,
        Instant createdAt,
        Instant updatedAt
) implements UCResponse {
}
