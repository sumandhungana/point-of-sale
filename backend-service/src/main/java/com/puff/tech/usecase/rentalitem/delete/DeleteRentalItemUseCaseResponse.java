package com.puff.tech.usecase.rentalitem.delete;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record DeleteRentalItemUseCaseResponse(
        String message
) implements UseCases.UseCaseResponse {
}
