package com.puff.tech.staffmanagement.usecase.staffattendance.create;

import com.puff.tech.core.usecases.UCRequest;
import com.puff.tech.domain.AttendanceStatus;
import io.micronaut.serde.annotation.Serdeable;

import java.time.Instant;

@Serdeable
public record CreateStaffAttendanceUCRequest(
        Long staffId,
        Instant date,
        AttendanceStatus status,
        String note
)
implements UCRequest {
}
