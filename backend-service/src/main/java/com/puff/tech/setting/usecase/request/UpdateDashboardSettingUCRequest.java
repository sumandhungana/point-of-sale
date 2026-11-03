package com.puff.tech.setting.usecase.request;

import com.puff.tech.core.usecases.UCRequest;
import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;
import lombok.Builder;

@Builder
@Serdeable
@Introspected
public record UpdateDashboardSettingUCRequest(
        Long id,
        Integer roleId,
        String roleName,
        Integer roleOrder,
        String dashboardType,
        Boolean enabled,
        String rowsConfig,
        Boolean showSupplierChart,
        Boolean showCustomerChart,
        Boolean showInventoryChart,
        Boolean showSystemMonitor
) implements UCRequest {
}

