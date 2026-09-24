package com.puff.tech.usermanagement.usecase.permissions.payload;

import com.puff.tech.core.usecases.UCResponse;
import io.micronaut.serde.annotation.Serdeable;
import lombok.Builder;

import java.util.List;

@Builder
@Serdeable
public record GetPermissionsUCResponse(
         String module,
         List<String> permissions) implements UCResponse {
}
