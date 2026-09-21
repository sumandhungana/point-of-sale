package com.puff.tech.staffmanagement.usecase.staffattendance.get;

import com.puff.tech.core.usecases.UseCases;
import com.puff.tech.domain.AttendanceStatus;
import io.micronaut.serde.annotation.Serdeable;

import java.time.Instant;

@Serdeable
public record GetStaffAttendanceUseCaseResponse(
        Integer id,
        Integer staffId,
        Instant date,
        AttendanceStatus status,
        String note,
        Instant createdAt,
        Instant updatedAt
)
implements UseCases.UseCaseResponse {
}
