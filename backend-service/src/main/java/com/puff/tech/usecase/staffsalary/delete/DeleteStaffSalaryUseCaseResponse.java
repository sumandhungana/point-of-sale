package com.puff.tech.usecase.staffsalary.delete;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record DeleteStaffSalaryUseCaseResponse(
        String message
) implements UseCase.UseCaseResponse {
}
