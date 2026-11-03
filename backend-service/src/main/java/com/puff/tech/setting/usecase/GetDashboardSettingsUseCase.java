package com.puff.tech.setting.usecase;

import com.puff.tech.core.usecases.MonoUC;
import com.puff.tech.security.UseCaseContext;
import com.puff.tech.setting.DashboardSettingsConverter;
import com.puff.tech.setting.repository.DashboardSettingsRepository;
import com.puff.tech.setting.usecase.request.DashboardSettingUCDto;
import com.puff.tech.setting.usecase.request.GetDashboardSettingUCRequest;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class GetDashboardSettingsUseCase implements MonoUC<GetDashboardSettingUCRequest, DashboardSettingUCDto> {

    private final DashboardSettingsRepository dashboardSettingsRepository;

    public GetDashboardSettingsUseCase(DashboardSettingsRepository dashboardSettingsRepository) {
        this.dashboardSettingsRepository = dashboardSettingsRepository;
    }

    @Override
    public Mono<DashboardSettingUCDto> execute(GetDashboardSettingUCRequest request, UseCaseContext context) {
        String roleName = context != null && context.securityContext() != null ? context.securityContext().roles().getFirst() : "";
       return dashboardSettingsRepository.findByRoleName(roleName)
                .map(DashboardSettingsConverter::toDto);

    }
}

