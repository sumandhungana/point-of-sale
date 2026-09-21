package com.puff.tech.staffmanagement.usecase.staffattendance.update;

import com.puff.tech.core.usecases.UseCases;
import com.puff.tech.domain.AttendanceStatus;
import io.micronaut.serde.annotation.Serdeable;

import java.time.Instant;

@Serdeable
public record UpdateSatffAttendanceUseCaseRequest(
        Integer id,
        Integer staffId,
        Instant date,
        AttendanceStatus status,
        String note
)implements UseCases.UseCaseRequest {
}
