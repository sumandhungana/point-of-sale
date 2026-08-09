package com.puff.tech.usecase.staffattendance.getbydate;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

import java.time.Instant;

@Serdeable
public record GetStaffAttendanceByDateUseCaseRequest(
        Instant date
) implements UseCase.UseCaseRequest {
}
