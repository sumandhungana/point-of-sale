package com.puff.tech.appsetting.usecase;

import com.puff.tech.appsetting.usecase.request.GetAppSettingUCRequest;
import com.puff.tech.appsetting.usecase.request.AppSettingUCDto;
import com.puff.tech.core.usecases.MonoUC;
import com.puff.tech.appsetting.repository.AppSettingsRepository;
import com.puff.tech.security.UseCaseContext;
import com.puff.tech.appsetting.AppSettingsConverter;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class GetAppSettingsUseCase implements MonoUC<GetAppSettingUCRequest, AppSettingUCDto> {

    private final AppSettingsRepository appSettingsRepository;

    @Inject
    public GetAppSettingsUseCase(AppSettingsRepository appSettingsRepository) {
        this.appSettingsRepository = appSettingsRepository;
    }

    @Override
    public Mono<AppSettingUCDto> execute(GetAppSettingUCRequest request, UseCaseContext context) {
        Long memberId = context.securityContext().memberId();
        return appSettingsRepository.findByMemberId(memberId)
                .switchIfEmpty(appSettingsRepository.findGlobalDefault())
                .map(AppSettingsConverter::toDto)
                .switchIfEmpty(Mono.just(AppSettingUCDto.builder().build()));
    }
}
