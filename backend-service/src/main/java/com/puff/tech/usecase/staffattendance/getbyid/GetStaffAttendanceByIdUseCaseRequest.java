package com.puff.tech.usecase.staffattendance.getbyid;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record GetStaffAttendanceByIdUseCaseRequest(
        Integer id
) implements UseCase.UseCaseRequest {
}
