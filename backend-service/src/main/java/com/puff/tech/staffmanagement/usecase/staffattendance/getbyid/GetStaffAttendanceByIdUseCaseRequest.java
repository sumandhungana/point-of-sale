package com.puff.tech.staffmanagement.usecase.staffattendance.getbyid;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record GetStaffAttendanceByIdUseCaseRequest(
        Integer id
) implements UseCases.UseCaseRequest {
}
