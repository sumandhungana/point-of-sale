package com.puff.tech.usecase.staffattendance.update;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record UpdateSatffAttendanceUseCaseResponse(
        String message
) implements UseCase.UseCaseResponse {
}
