package com.puff.tech.staffmanagement.usecase.staffsalary.delete;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record DeleteStaffSalaryUseCaseResponse(
        String message
) implements UseCases.UseCaseResponse {
}
