package com.puff.tech.staffmanagement.usecase.staffattendance.delete;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record DeleteStaffAttendanceUseCaseRequest(
        Integer id
) implements UseCases.UseCaseRequest {
}
