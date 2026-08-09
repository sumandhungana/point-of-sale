package com.puff.tech.usecase.staff.create;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record CreateStaffUseCaseResponse(
        String message
) implements UseCase.UseCaseResponse {
}
