package com.puff.tech.staffmanagement.usecase.staff.getsalary;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record GetStaffSalaryUseCaseRequest(
        Integer staffId
) implements UseCases.UseCaseRequest {
}
