package com.puff.tech.setting.controller;

import com.puff.tech.core.responses.RestResponse;
import com.puff.tech.security.Secured;
import com.puff.tech.setting.usecase.GetConfigurableRolesUseCase;
import com.puff.tech.setting.usecase.GetDashboardSettingsUseCase;
import com.puff.tech.setting.usecase.ResetDashboardSettingsUseCase;
import com.puff.tech.setting.usecase.UpdateDashboardSettingsUseCase;
import com.puff.tech.setting.usecase.request.DashboardSettingUCDto;
import com.puff.tech.setting.usecase.request.GetDashboardSettingUCRequest;
import com.puff.tech.setting.usecase.request.ResetDashboardSettingUCRequest;
import com.puff.tech.setting.usecase.request.RoleOrderDto;
import com.puff.tech.setting.usecase.request.UpdateDashboardSettingUCRequest;
import io.micronaut.core.annotation.Nullable;
import io.micronaut.http.annotation.*;
import jakarta.inject.Inject;
import reactor.core.publisher.Mono;

import java.util.List;

@Controller("/dashboard-settings")
public class DashboardSettingsController {

    private final GetDashboardSettingsUseCase getDashboardSettingsUseCase;
    private final UpdateDashboardSettingsUseCase updateDashboardSettingsUseCase;
    private final ResetDashboardSettingsUseCase resetDashboardSettingsUseCase;
    private final GetConfigurableRolesUseCase getConfigurableRolesUseCase;

    @Inject
    public DashboardSettingsController(GetDashboardSettingsUseCase getDashboardSettingsUseCase,
                                      UpdateDashboardSettingsUseCase updateDashboardSettingsUseCase,
                                      ResetDashboardSettingsUseCase resetDashboardSettingsUseCase,
                                      GetConfigurableRolesUseCase getConfigurableRolesUseCase) {
        this.getDashboardSettingsUseCase = getDashboardSettingsUseCase;
        this.updateDashboardSettingsUseCase = updateDashboardSettingsUseCase;
        this.resetDashboardSettingsUseCase = resetDashboardSettingsUseCase;
        this.getConfigurableRolesUseCase = getConfigurableRolesUseCase;
    }

    /**
     * Fetch list of roles available to be configured by the logged-in user according to role order:
     * - Order 1 (Super Admin): Order 1 and Order 2 roles
     * - Order 2 (Admin): Order 3 roles (less than Admin)
     */
    @Secured
    @Get("/roles")
    public Mono<RestResponse<List<RoleOrderDto>>> getConfigurableRoles() {
        return getConfigurableRolesUseCase.execute(new GetConfigurableRolesUseCase.Request())
                .collectList()
                .map(RestResponse::success)
                .onErrorResume(err -> Mono.just(RestResponse.error("Failed to fetch configurable roles: " + err.getMessage())));
    }

    /**
     * Fetch dashboard configuration for a specific role
     */
    @Secured
    @Get
    public Mono<RestResponse<DashboardSettingUCDto>> getSettings() {
        return getDashboardSettingsUseCase.execute(new GetDashboardSettingUCRequest())
                .map(RestResponse::success)
                .onErrorResume(err -> Mono.just(RestResponse.error("Failed to fetch dashboard settings: " + err.getMessage())));
    }

    /**
     * Update dashboard configuration for a role with hierarchy validation
     */
    @Secured
    @Put
    public Mono<RestResponse<DashboardSettingUCDto>> updateSettings(@Body UpdateDashboardSettingUCRequest request) {
        return updateDashboardSettingsUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err -> Mono.just(RestResponse.error("Failed to update dashboard settings: " + err.getMessage())));
    }

    /**
     * Reset dashboard configuration for a role back to default preset
     */
    @Secured
    @Post("/reset")
    public Mono<RestResponse<DashboardSettingUCDto>> resetSettings(@QueryValue @Nullable String roleName) {
        return resetDashboardSettingsUseCase.execute(new ResetDashboardSettingUCRequest(roleName))
                .map(RestResponse::success)
                .onErrorResume(err -> Mono.just(RestResponse.error("Failed to reset dashboard settings: " + err.getMessage())));
    }
}
