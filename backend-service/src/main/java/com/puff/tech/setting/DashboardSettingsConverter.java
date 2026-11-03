package com.puff.tech.setting;

import com.puff.tech.setting.repository.DashboardSettingsEntity;
import com.puff.tech.setting.usecase.request.DashboardSettingUCDto;

public class DashboardSettingsConverter {

    public static final String DEFAULT_ADMIN_ROWS =
            "[{\"id\":\"row-1\",\"widgets\":[\"total_organizations\",\"total_users\",\"total_roles\",\"total_staff\"]}," +
            "{\"id\":\"row-2\",\"widgets\":[\"total_customers\",\"total_suppliers\",\"total_sales\",\"total_purchase\"]}," +
            "{\"id\":\"row-3\",\"widgets\":[\"total_due\",\"total_paid\",\"total_income\",\"total_expenses\"]}]";

    public static final String DEFAULT_USER_ROWS =
            "[{\"id\":\"row-1\",\"widgets\":[\"total_sales\",\"total_paid\",\"total_due\",\"total_customers\"]}," +
            "{\"id\":\"row-2\",\"widgets\":[\"total_expenses\",\"total_cashbook\"]}]";

    public static DashboardSettingUCDto toDto(DashboardSettingsEntity entity) {
        if (entity == null) return null;

        int order = entity.getRoleOrder() != null ? entity.getRoleOrder() : 3;
        String dashboardType = entity.getDashboardType();
        if (order == 1 && (dashboardType == null || dashboardType.isBlank() || "admin".equalsIgnoreCase(dashboardType))) {
            dashboardType = "Super Admin";
        } else if (order == 2 && (dashboardType == null || dashboardType.isBlank() || "super admin".equalsIgnoreCase(dashboardType))) {
            dashboardType = "Admin";
        } else if (dashboardType == null || dashboardType.isBlank()) {
            dashboardType = entity.getRoleName() != null ? entity.getRoleName() : "Custom";
        }

        return DashboardSettingUCDto.builder()
                .id(entity.getId())
                .memberId(entity.getMember() != null ? entity.getMember().getId() : null)
                .roleId(entity.getRoleId())
                .roleName(entity.getRoleName())
                .roleOrder(order)
                .dashboardType(dashboardType)
                .enabled(entity.getEnabled())
                .rowsConfig(entity.getRowsConfig())
                .showSupplierChart(entity.getShowSupplierChart())
                .showCustomerChart(entity.getShowCustomerChart())
                .showInventoryChart(entity.getShowInventoryChart())
                .showSystemMonitor(entity.getShowSystemMonitor())
                .updatedBy(entity.getUpdatedBy())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public static DashboardSettingUCDto createDefaultDto(String roleName, Integer roleOrder) {
        int order = roleOrder != null ? roleOrder : 3;
        boolean isAdminTier = order <= 2;
        String dashboardType = "";
        if(order == 1)
            dashboardType = "Super Admin";
        else if(order == 2)
            dashboardType = "Admin";
        else
            dashboardType = roleName;

        return DashboardSettingUCDto.builder()
                .roleName(roleName)
                .roleOrder(order)
                .dashboardType(dashboardType)
                .enabled(true)
                .rowsConfig(isAdminTier ? DEFAULT_ADMIN_ROWS : DEFAULT_USER_ROWS)
                .showSupplierChart(isAdminTier)
                .showCustomerChart(true)
                .showInventoryChart(isAdminTier)
                .showSystemMonitor(isAdminTier)
                .updatedBy("system")
                .build();
    }
}
