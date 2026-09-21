package com.puff.tech.staffmanagement.usecase.staffsalary.create;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record CreateStaffSalaryUseCaseResponse(
        String message
) implements UseCases.UseCaseResponse {
}
