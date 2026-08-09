package com.puff.tech.usecase.rentalitem.create;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record CreateRentalItemUseCaseResponse(
        String message
)
implements UseCase.UseCaseResponse {
}
