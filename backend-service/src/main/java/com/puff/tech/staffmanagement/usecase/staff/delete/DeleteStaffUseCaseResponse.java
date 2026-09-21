package com.puff.tech.staffmanagement.usecase.staff.delete;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record DeleteStaffUseCaseResponse(
        String message
) implements UseCases.UseCaseResponse {
}
