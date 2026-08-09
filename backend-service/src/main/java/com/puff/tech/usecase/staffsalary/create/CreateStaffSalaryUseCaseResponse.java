package com.puff.tech.usecase.staffsalary.create;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record CreateStaffSalaryUseCaseResponse(
        String message
) implements UseCase.UseCaseResponse {
}
