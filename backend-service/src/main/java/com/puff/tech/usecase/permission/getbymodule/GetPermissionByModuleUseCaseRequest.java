package com.puff.tech.usecase.permission.getbymodule;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record GetPermissionByModuleUseCaseRequest(
        String module
) implements UseCases.UseCaseRequest {
}
