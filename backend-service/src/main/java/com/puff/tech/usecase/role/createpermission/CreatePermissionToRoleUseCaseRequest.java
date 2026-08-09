package com.puff.tech.usecase.role.createpermission;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

import java.util.List;

@Serdeable
public record CreatePermissionToRoleUseCaseRequest(
        Integer roleId,
        List<Integer> permissionIds
)
implements UseCase.UseCaseRequest {
}
