package com.puff.tech.staffmanagement.usecase.staff.get;

import io.micronaut.serde.annotation.Serdeable;

import java.time.Instant;

@Serdeable
public record StaffAttendanceResponse(
        Integer id,
        Instant attendanceDate,
        String status,
        String remarks,
        Instant createdAt,
        Instant updatedAt
) {
}
