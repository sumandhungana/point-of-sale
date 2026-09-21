package com.puff.tech.staffmanagement.usecase.staffattendance.create;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record CreateStaffAtendanceUseCaseResponse(
        String message
) implements UseCases.UseCaseResponse {
}
