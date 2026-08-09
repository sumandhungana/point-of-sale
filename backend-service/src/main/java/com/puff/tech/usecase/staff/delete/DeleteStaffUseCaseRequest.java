package com.puff.tech.usecase.staff.delete;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record DeleteStaffUseCaseRequest(
        Integer id
)implements UseCase.UseCaseRequest {
}
