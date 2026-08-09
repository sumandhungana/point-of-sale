package com.puff.tech.usecase.staff.getone;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record GetOneStaffUseCaseRequest(
        Integer id
) implements UseCase.UseCaseRequest {
}
