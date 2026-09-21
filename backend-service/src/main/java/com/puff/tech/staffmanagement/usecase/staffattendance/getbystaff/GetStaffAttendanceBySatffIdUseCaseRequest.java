package com.puff.tech.staffmanagement.usecase.staffattendance.getbystaff;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record GetStaffAttendanceBySatffIdUseCaseRequest(
        Integer staffId
)implements UseCases.UseCaseRequest {
}
