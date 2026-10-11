package com.puff.tech.rentalitem.usecase.add;

import com.puff.tech.core.usecases.UCResponse;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record AddRentalUCResponse(
        Long id,
        String rentalItemName
) implements UCResponse {
}
