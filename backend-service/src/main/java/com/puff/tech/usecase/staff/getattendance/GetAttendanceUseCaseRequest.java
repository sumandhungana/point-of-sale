package com.puff.tech.usecase.staff.getattendance;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record GetAttendanceUseCaseRequest(
        Integer id
)implements UseCase.UseCaseRequest {
}
