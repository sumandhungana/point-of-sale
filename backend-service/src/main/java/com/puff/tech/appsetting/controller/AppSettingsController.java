package com.puff.tech.appsetting.controller;

import com.puff.tech.appsetting.usecase.GetAppSettingsUseCase;
import com.puff.tech.appsetting.usecase.ResetAppSettingsUseCase;
import com.puff.tech.appsetting.usecase.UpdateAppSettingsUseCase;
import com.puff.tech.appsetting.usecase.request.AppSettingUCDto;
import com.puff.tech.appsetting.usecase.request.GetAppSettingUCRequest;
import com.puff.tech.appsetting.usecase.request.ResetAppSettingsUCRequest;
import com.puff.tech.appsetting.usecase.request.UpdateAppSettingsUCRequest;
import com.puff.tech.core.responses.RestResponse;
import com.puff.tech.security.Secured;
import com.puff.tech.usermanagement.enums.Permission;
import io.micronaut.http.annotation.*;
import jakarta.inject.Inject;
import reactor.core.publisher.Mono;

@Controller("/app-settings")
public class AppSettingsController {

    private final GetAppSettingsUseCase getAppSettingsUseCase;
    private final UpdateAppSettingsUseCase updateAppSettingsUseCase;
    private final ResetAppSettingsUseCase resetAppSettingsUseCase;

    @Inject
    public AppSettingsController(GetAppSettingsUseCase getAppSettingsUseCase,
                                UpdateAppSettingsUseCase updateAppSettingsUseCase,
                                ResetAppSettingsUseCase resetAppSettingsUseCase) {
        this.getAppSettingsUseCase = getAppSettingsUseCase;
        this.updateAppSettingsUseCase = updateAppSettingsUseCase;
        this.resetAppSettingsUseCase = resetAppSettingsUseCase;
    }

    @Secured(permissions = {Permission.APP_SETTINGS_VIEW})
    @Get
    public Mono<RestResponse<AppSettingUCDto>> getSettings() {
        return getAppSettingsUseCase.execute(new GetAppSettingUCRequest())
                .map(RestResponse::success)
                .onErrorResume(err -> Mono.just(RestResponse.error("Failed to fetch app settings: " + err.getMessage())));
    }

    @Secured(permissions = {Permission.APP_SETTINGS_UPDATE})
    @Put
    public Mono<RestResponse<AppSettingUCDto>> updateSettings(@Body UpdateAppSettingsUCRequest request) {
        return updateAppSettingsUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err -> Mono.just(RestResponse.error("Failed to update app settings: " + err.getMessage())));
    }

    @Secured(permissions = {Permission.APP_SETTINGS_RESET})
    @Post("/reset")
    public Mono<RestResponse<AppSettingUCDto>> resetSettings() {
        return resetAppSettingsUseCase.execute(new ResetAppSettingsUCRequest())
                .map(RestResponse::success)
                .onErrorResume(err -> Mono.just(RestResponse.error("Failed to reset app settings: " + err.getMessage())));
    }
}
