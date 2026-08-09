package com.puff.tech.usecase.staffsalary.update;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record UpdateStaffSalaryUseCaseResponse(
        String message
) implements UseCase.UseCaseResponse {
}
