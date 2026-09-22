package com.puff.tech.staffmanagement.usecase.staff.create;

import com.puff.tech.core.usecases.UCResponse;
import com.puff.tech.core.usecases.UseCase;
import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record CreateStaffUseCaseResponse(
        String message,
        Integer id
) implements UCResponse {
}
