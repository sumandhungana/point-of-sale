package com.puff.tech.usecase.staff.getsalary;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record GetStaffSalaryUseCaseRequest(
        Integer staffId
) implements UseCase.UseCaseRequest {
}
