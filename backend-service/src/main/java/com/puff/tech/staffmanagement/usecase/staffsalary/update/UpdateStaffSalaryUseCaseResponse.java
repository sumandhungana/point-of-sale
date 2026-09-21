package com.puff.tech.staffmanagement.usecase.staffsalary.update;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record UpdateStaffSalaryUseCaseResponse(
        String message
) implements UseCases.UseCaseResponse {
}
