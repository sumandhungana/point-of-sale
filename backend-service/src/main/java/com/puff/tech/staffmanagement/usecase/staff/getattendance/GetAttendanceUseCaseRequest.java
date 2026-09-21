package com.puff.tech.staffmanagement.usecase.staff.getattendance;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record GetAttendanceUseCaseRequest(
        Integer id
)implements UseCases.UseCaseRequest {
}
