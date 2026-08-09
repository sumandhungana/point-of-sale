package com.puff.tech.usecase.rentalitem.update;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record UpdateRentalItemUseCaseResponse(
        String message
) implements UseCase.UseCaseResponse {
}
