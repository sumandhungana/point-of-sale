package com.puff.tech.staffmanagement.usecase.staffsalary.getbystaffid;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record GetStaffSalaryByStaffIdUseCaseRequest(
        Integer staffId
) implements UseCases.UseCaseRequest {
}
