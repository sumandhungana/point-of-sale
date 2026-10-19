package com.puff.tech.staffmanagement.usecase.staffattendance.get;

import com.puff.tech.core.usecases.UCResponse;
import com.puff.tech.domain.AttendanceStatus;
import io.micronaut.serde.annotation.Serdeable;

import java.time.Instant;

@Serdeable
public record GetStaffAttendanceUCResponse(
        Long id,
        Long staffId,
        Instant date,
        AttendanceStatus status,
        String note,
        Instant createdAt,
        Instant updatedAt
)
        implements UCResponse {
}
