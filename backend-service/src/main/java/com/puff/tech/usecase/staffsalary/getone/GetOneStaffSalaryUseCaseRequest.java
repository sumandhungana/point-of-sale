package com.puff.tech.usecase.staffsalary.getone;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record GetOneStaffSalaryUseCaseRequest(
        Integer id
) implements UseCase.UseCaseRequest {
}
