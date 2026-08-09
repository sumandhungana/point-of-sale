package com.puff.tech.usecase.staffattendance.getbystaff;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record GetStaffAttendanceBySatffIdUseCaseRequest(
        Integer staffId
)implements UseCase.UseCaseRequest {
}
