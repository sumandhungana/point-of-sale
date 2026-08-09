package com.puff.tech.usecase.staffsalary.delete;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record DeleteStaffSalaryUseCaseRequest(
        Integer id
)implements UseCase.UseCaseRequest {
}
