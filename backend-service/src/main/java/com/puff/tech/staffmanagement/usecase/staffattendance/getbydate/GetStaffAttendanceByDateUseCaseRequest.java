package com.puff.tech.staffmanagement.usecase.staffattendance.getbydate;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

import java.time.Instant;

@Serdeable
public record GetStaffAttendanceByDateUseCaseRequest(
        Instant date
) implements UseCases.UseCaseRequest {
}
