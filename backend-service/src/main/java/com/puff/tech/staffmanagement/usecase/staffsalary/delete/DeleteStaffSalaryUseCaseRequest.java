package com.puff.tech.staffmanagement.usecase.staffsalary.delete;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record DeleteStaffSalaryUseCaseRequest(
        Integer id
)implements UseCases.UseCaseRequest {
}
