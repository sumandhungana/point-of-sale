package com.puff.tech.staffmanagement.usecase.staffsalary.getone;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record GetOneStaffSalaryUseCaseRequest(
        Integer id
) implements UseCases.UseCaseRequest {
}
