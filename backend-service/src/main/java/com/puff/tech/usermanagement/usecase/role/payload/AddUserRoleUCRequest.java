package com.puff.tech.usermanagement.usecase.role.payload;

import com.puff.tech.core.usecases.UCRequest;
import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

@Serdeable
public record AddUserRoleUCRequest(
        @NotBlank(message = "Role name is required")
        String name,

        String description,

        @NotNull(message = "Permissions cannot be null")
        List<PermissionRequest> permissions
) implements UCRequest {
    @Serdeable
    @Introspected
    public record PermissionRequest(
            @NotBlank(message = "Module is required")
            String module,

            @NotNull(message = "Permissions list is required")
            List<String> permissions
    ) {}
}
