package com.puff.tech.usecase.rentalitem.getone;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record GetOneRentalItemUseCaseRequest(
        Integer id
) implements UseCases.UseCaseRequest {
}
