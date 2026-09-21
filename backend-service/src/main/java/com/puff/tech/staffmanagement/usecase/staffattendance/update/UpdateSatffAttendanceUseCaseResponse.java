package com.puff.tech.staffmanagement.usecase.staffattendance.update;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record UpdateSatffAttendanceUseCaseResponse(
        String message
) implements UseCases.UseCaseResponse {
}
