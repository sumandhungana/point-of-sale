package com.puff.tech.usecase.staffattendance.create;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record CreateStaffAtendanceUseCaseResponse(
        String message
) implements UseCase.UseCaseResponse {
}
