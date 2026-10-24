package com.puff.tech.appsetting.usecase;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.puff.tech.appsetting.AppSettingsConverter;
import com.puff.tech.appsetting.repository.AppSettingsAuditEntity;
import com.puff.tech.appsetting.repository.AppSettingsAuditRepository;
import com.puff.tech.appsetting.repository.AppSettingsEntity;
import com.puff.tech.appsetting.repository.AppSettingsRepository;
import com.puff.tech.appsetting.usecase.request.AppSettingUCDto;
import com.puff.tech.appsetting.usecase.request.ResetAppSettingsUCRequest;
import com.puff.tech.core.usecases.MonoUC;
import com.puff.tech.onboarding.repository.MemberEntity;
import com.puff.tech.security.UseCaseContext;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

import java.time.Instant;

@Singleton
public class ResetAppSettingsUseCase implements MonoUC<ResetAppSettingsUCRequest, AppSettingUCDto> {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    private final AppSettingsRepository appSettingsRepository;
    private final AppSettingsAuditRepository auditRepository;

    @Inject
    public ResetAppSettingsUseCase(AppSettingsRepository appSettingsRepository,
                                  AppSettingsAuditRepository auditRepository) {
        this.appSettingsRepository = appSettingsRepository;
        this.auditRepository = auditRepository;
    }

    @Override
    public Mono<AppSettingUCDto> execute(ResetAppSettingsUCRequest request, UseCaseContext context) {
        Long memberId = context != null && context.securityContext() != null ? context.securityContext().memberId() : null;
        String username = context != null && context.securityContext() != null && context.securityContext().subject() != null
                ? context.securityContext().subject() : "system";

        return appSettingsRepository.findByMemberId(memberId)
                .flatMap(entity -> {
                    String prevJson = toJson(entity);

                    // Reset to default styling and configurations
                    entity.setSideMenuBgColor("#ffffff");
                    entity.setSideMenuBgEndColor("#ffffff");
                    entity.setSideMenuFontColor("#000000");
                    entity.setSideMenuHoverFontColor("#ffffff");
                    entity.setSideMenuHoverBgColor("#000000");
                    entity.setTopMenuBgColor("#ffffff");
                    entity.setTopMenuFontColor("#000000");

                    entity.setAppBgColor("#f8f9fa");
                    entity.setAppForegroundColor("#212529");

                    entity.setLogoPath(null);
                    entity.setFaviconPath(null);
                    entity.setLoginBgPath(null);

                    entity.setCurrency("रु");
                    entity.setCurrencyPosition("before");
                    entity.setDateFormat("DD/MM/YYYY");
                    entity.setTimeFormat("HH:mm");
                    entity.setNumberFormat("1,234.56");
                    entity.setLanguage("English");

                    entity.setUpdatedBy(username);
                    entity.setUpdatedAt(Instant.now());

                    return appSettingsRepository.update(entity)
                            .flatMap(saved -> {
                                AppSettingsAuditEntity audit = new AppSettingsAuditEntity();
                                audit.setAppSettingsId(saved.getId());
                                if (saved.getMember() != null) {
                                    audit.setMember(saved.getMember());
                                }
                                audit.setChangedBy(username);
                                audit.setAction("RESET");
                                audit.setPreviousValues(prevJson);
                                audit.setNewValues(toJson(saved));
                                audit.setChangedAt(Instant.now());

                                return auditRepository.save(audit)
                                        .onErrorResume(e -> Mono.empty())
                                        .thenReturn(AppSettingsConverter.toDto(saved));
                            });
                })
                .switchIfEmpty(Mono.defer(() -> {
                    AppSettingsEntity def = new AppSettingsEntity();
                    if (memberId != null) {
                        MemberEntity member = new MemberEntity();
                        member.setId(memberId);
                        def.setMember(member);
                    }
                    def.setUpdatedBy(username);
                    return appSettingsRepository.save(def)
                            .map(AppSettingsConverter::toDto);
                }));
    }

    private String toJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            return "{}";
        }
    }
}
