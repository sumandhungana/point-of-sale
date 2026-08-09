package com.puff.tech.usecase.staffsalary.getbystaffid;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record GetStaffSalaryByStaffIdUseCaseRequest(
        Integer staffId
) implements UseCase.UseCaseRequest {
}
