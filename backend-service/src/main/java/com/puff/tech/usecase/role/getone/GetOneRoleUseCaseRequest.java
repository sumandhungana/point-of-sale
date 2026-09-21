package com.puff.tech.usecase.role.getone;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record GetOneRoleUseCaseRequest(
        Integer id
) implements UseCases.UseCaseRequest {
}
