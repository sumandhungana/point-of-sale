package com.puff.tech.usecase.permission.getbymodule;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record GetPermissionByModuleUseCaseRequest(
        String module
) implements UseCase.UseCaseRequest {
}
