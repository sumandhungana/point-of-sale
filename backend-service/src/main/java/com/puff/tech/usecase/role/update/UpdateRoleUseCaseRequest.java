package com.puff.tech.usecase.role.update;

import com.puff.tech.core.usecases.UseCase;

public record UpdateRoleUseCaseRequest(
        Integer id,
        String name,
        String status,
        String description
) implements UseCase.UseCaseRequest {
}
