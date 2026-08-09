package com.puff.tech.usecase.staff.delete;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;
import jakarta.inject.Inject;

@Serdeable
public record DeleteStaffUseCaseResponse(
        String message
) implements UseCase.UseCaseResponse {
}
