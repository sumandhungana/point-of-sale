package com.puff.tech.usecase.rentalitem.delete;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record DeleteRentalItemUseCaseResponse(
        String message
) implements UseCase.UseCaseResponse {
}
