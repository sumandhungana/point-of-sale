package com.puff.tech.staffmanagement.usecase.staffattendance.create;

import com.puff.tech.core.usecases.UseCases;
import com.puff.tech.domain.AttendanceStatus;
import io.micronaut.serde.annotation.Serdeable;

import java.time.Instant;

@Serdeable
public record CreateStaffAtendanceUseCaseRequest(
        Integer staffId,
        Instant date,
        AttendanceStatus status,
        String note
)
implements UseCases.UseCaseRequest {
}
