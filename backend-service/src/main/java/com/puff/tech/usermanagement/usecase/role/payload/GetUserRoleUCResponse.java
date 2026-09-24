package com.puff.tech.usermanagement.usecase.role.payload;
import com.puff.tech.core.usecases.UCResponse;
import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

import java.time.Instant;
import java.util.List;

@Serdeable
@Introspected
public record GetUserRoleUCResponse(
        Integer id,
        String name,
        String description,
        String status,
        List<PermissionResponse> permissions,
        Instant createdAt,
        Instant updatedAt
) implements UCResponse {

    @Serdeable
    @Introspected
    public record PermissionResponse(
            Integer id,
            String module,
            List<String> permissions
    ) {}
}
