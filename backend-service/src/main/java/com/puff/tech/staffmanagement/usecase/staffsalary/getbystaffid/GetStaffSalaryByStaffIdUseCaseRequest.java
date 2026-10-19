package com.puff.tech.staffmanagement.usecase.staffsalary.getbystaffid;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record GetStaffSalaryByStaffIdUseCaseRequest(
        Long staffId
) implements UseCases.UseCaseRequest {
}
