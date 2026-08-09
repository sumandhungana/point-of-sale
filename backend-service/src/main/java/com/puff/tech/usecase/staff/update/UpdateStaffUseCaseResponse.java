package com.puff.tech.usecase.staff.update;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record UpdateStaffUseCaseResponse(
        String message
)implements UseCase.UseCaseResponse {
}
