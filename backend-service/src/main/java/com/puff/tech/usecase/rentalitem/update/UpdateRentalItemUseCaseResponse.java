package com.puff.tech.usecase.rentalitem.update;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record UpdateRentalItemUseCaseResponse(
        String message
) implements UseCases.UseCaseResponse {
}
