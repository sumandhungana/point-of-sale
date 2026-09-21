package com.puff.tech.staffmanagement.usecase.staff.update;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record UpdateStaffUseCaseResponse(
        String message
)implements UseCases.UseCaseResponse {
}
