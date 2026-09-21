package com.puff.tech.usecase.rentalitem.create;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record CreateRentalItemUseCaseResponse(
        String message
)
implements UseCases.UseCaseResponse {
}
