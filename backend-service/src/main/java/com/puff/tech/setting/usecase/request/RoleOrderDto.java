package com.puff.tech.setting.usecase.request;

import com.puff.tech.core.usecases.UCResponse;
import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;
import lombok.Builder;

@Serdeable
@Introspected
@Builder
public record RoleOrderDto(
        Integer id,
        String name,
        String description,
        Integer roleOrder,
        String roleCategory
) implements UCResponse {
}

