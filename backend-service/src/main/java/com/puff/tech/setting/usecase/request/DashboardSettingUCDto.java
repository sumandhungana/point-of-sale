package com.puff.tech.setting.usecase.request;

import com.puff.tech.core.usecases.UCResponse;
import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;
import lombok.Builder;

import java.time.Instant;

@Serdeable
@Introspected
@Builder
public record DashboardSettingUCDto(
        Long id,
        Long memberId,
        Integer roleId,
        String roleName,
        Integer roleOrder,
        String dashboardType,
        Boolean enabled,
        String rowsConfig,
        Boolean showSupplierChart,
        Boolean showCustomerChart,
        Boolean showInventoryChart,
        Boolean showSystemMonitor,
        String updatedBy,
        Instant createdAt,
        Instant updatedAt
) implements UCResponse {
}

