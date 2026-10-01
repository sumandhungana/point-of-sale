package com.puff.tech.usermanagement.usecase.role.payload;

import com.puff.tech.core.usecases.UCRequest;
import io.micronaut.serde.annotation.Serdeable;

import java.util.List;

@Serdeable
public record UpdateRolePermissionUCRequest(
        Long id,
        String name,
        String description,
        List<AddUserRoleUCRequest.PermissionRequest> permissions

) implements UCRequest {
}
