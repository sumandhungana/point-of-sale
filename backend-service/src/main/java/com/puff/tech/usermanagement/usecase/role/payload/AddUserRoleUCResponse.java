package com.puff.tech.usermanagement.usecase.role.payload;

import com.puff.tech.core.usecases.UCResponse;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record AddUserRoleUCResponse(
        Integer id,
        String message
) implements UCResponse {
    public static AddUserRoleUCResponse success(Integer id) {
        return new AddUserRoleUCResponse(id, "User role created successfully");
    }
}
