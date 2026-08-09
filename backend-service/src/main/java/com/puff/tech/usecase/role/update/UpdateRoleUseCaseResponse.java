package com.puff.tech.usecase.role.update;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record UpdateRoleUseCaseResponse(
        String messsage
) implements UseCase.UseCaseResponse {
}
