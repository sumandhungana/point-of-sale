package com.puff.tech.rentalitem.usecase.add;

import com.puff.tech.core.usecases.UCRequest;
import io.micronaut.serde.annotation.Serdeable;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Serdeable
public record AddRentalUCRequest(
        @NotBlank String rentalItemName,
        @NotBlank String phoneNumber,
        String address,
        @NotNull BigDecimal rentalAmount,
        @NotBlank String rentalPeriod,
        @NotNull LocalDateTime startDate,
        @NotNull LocalDateTime endDate,
        String remarks
) implements UCRequest {
}
