package com.puff.tech.staffmanagement.usecase.staff.delete;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record DeleteStaffUseCaseRequest(
        Integer id
)implements UseCases.UseCaseRequest {
}
