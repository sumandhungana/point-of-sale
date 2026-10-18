package com.puff.tech.appsetting.usecase;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.puff.tech.appsetting.AppSettingsConverter;
import com.puff.tech.appsetting.repository.AppSettingsAuditEntity;
import com.puff.tech.appsetting.repository.AppSettingsAuditRepository;
import com.puff.tech.appsetting.repository.AppSettingsEntity;
import com.puff.tech.appsetting.repository.AppSettingsRepository;
import com.puff.tech.appsetting.usecase.request.AppSettingUCDto;
import com.puff.tech.appsetting.usecase.request.UpdateAppSettingsUCRequest;
import com.puff.tech.core.usecases.MonoUC;
import com.puff.tech.onboarding.repository.MemberEntity;
import com.puff.tech.security.UseCaseContext;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.util.regex.Pattern;

@Singleton
public class UpdateAppSettingsUseCase implements MonoUC<UpdateAppSettingsUCRequest, AppSettingUCDto> {

    private static final Pattern HEX_COLOR_PATTERN = Pattern.compile("^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$");
    private static final ObjectMapper objectMapper = new ObjectMapper();

    private final AppSettingsRepository appSettingsRepository;
    private final AppSettingsAuditRepository auditRepository;

    @Inject
    public UpdateAppSettingsUseCase(AppSettingsRepository appSettingsRepository,
                                   AppSettingsAuditRepository auditRepository) {
        this.appSettingsRepository = appSettingsRepository;
        this.auditRepository = auditRepository;
    }

    @Override
    public Mono<AppSettingUCDto> execute(UpdateAppSettingsUCRequest request, UseCaseContext context) {
        Long memberId = context != null && context.securityContext() != null ? context.securityContext().memberId() : null;
        String username = context != null && context.securityContext() != null && context.securityContext().subject() != null
                ? context.securityContext().subject() : "system";

        return appSettingsRepository.findByMemberId(memberId)
                .switchIfEmpty(Mono.defer(() -> {
                    AppSettingsEntity newEntity = new AppSettingsEntity();
                    if (memberId != null) {
                        MemberEntity member = new MemberEntity();
                        member.setId(memberId);
                        newEntity.setMember(member);
                    }
                    return Mono.just(newEntity);
                }))
                .flatMap(entity -> {
                    String prevJson = toJson(entity);

                    // Validate & Apply Colors
                    if (isValidHex(request.sideMenuBgColor())) entity.setSideMenuBgColor(request.sideMenuBgColor());
                    if (isValidHex(request.sideMenuBgEndColor())) entity.setSideMenuBgEndColor(request.sideMenuBgEndColor());
                    if (isValidHex(request.sideMenuFontColor())) entity.setSideMenuFontColor(request.sideMenuFontColor());
                    if (isValidHex(request.sideMenuHoverFontColor())) entity.setSideMenuHoverFontColor(request.sideMenuHoverFontColor());
                    if (isValidHex(request.sideMenuHoverBgColor())) entity.setSideMenuHoverBgColor(request.sideMenuHoverBgColor());

                    if (isValidHex(request.topMenuBgColor())) entity.setTopMenuBgColor(request.topMenuBgColor());
                    if (isValidHex(request.topMenuFontColor())) entity.setTopMenuFontColor(request.topMenuFontColor());

                    if (isValidHex(request.appBgColor())) entity.setAppBgColor(request.appBgColor());
                    if (isValidHex(request.appForegroundColor())) entity.setAppForegroundColor(request.appForegroundColor());

                    // Apply Images
                    if (request.logoPath() != null) entity.setLogoPath(request.logoPath());
                    if (request.faviconPath() != null) entity.setFaviconPath(request.faviconPath());
                    if (request.loginBgPath() != null) entity.setLoginBgPath(request.loginBgPath());

                    // General Settings
                    if (request.currency() != null && !request.currency().trim().isEmpty()) {
                        entity.setCurrency(request.currency().trim());
                    }
                    if ("before".equalsIgnoreCase(request.currencyPosition()) || "after".equalsIgnoreCase(request.currencyPosition())) {
                        entity.setCurrencyPosition(request.currencyPosition().toLowerCase());
                    }
                    if (request.dateFormat() != null && !request.dateFormat().trim().isEmpty()) {
                        entity.setDateFormat(request.dateFormat().trim());
                    }
                    if (request.timeFormat() != null && !request.timeFormat().trim().isEmpty()) {
                        entity.setTimeFormat(request.timeFormat().trim());
                    }
                    if (request.numberFormat() != null && !request.numberFormat().trim().isEmpty()) {
                        entity.setNumberFormat(request.numberFormat().trim());
                    }
                    if (request.language() != null && !request.language().trim().isEmpty()) {
                        entity.setLanguage(request.language().trim());
                    }

                    entity.setUpdatedBy(username);
                    entity.setUpdatedAt(Instant.now());

                    if (entity.getMember() == null && memberId != null) {
                        MemberEntity member = new MemberEntity();
                        member.setId(memberId);
                        entity.setMember(member);
                    }

                    Mono<AppSettingsEntity> saveMono = entity.getId() != null
                            ? appSettingsRepository.update(entity)
                            : appSettingsRepository.save(entity);

                    return saveMono.flatMap(saved -> {
                        AppSettingsAuditEntity audit = new AppSettingsAuditEntity();
                        audit.setAppSettingsId(saved.getId());
                        if (saved.getMember() != null) {
                            audit.setMember(saved.getMember());
                        }
                        audit.setChangedBy(username);
                        audit.setAction(entity.getId() != null ? "UPDATE" : "CREATE");
                        audit.setPreviousValues(prevJson);
                        audit.setNewValues(toJson(saved));
                        audit.setChangedAt(Instant.now());

                        return auditRepository.save(audit)
                                .onErrorResume(e -> Mono.empty())
                                .thenReturn(AppSettingsConverter.toDto(saved));
                    });
                });
    }

    private boolean isValidHex(String color) {
        return color != null && HEX_COLOR_PATTERN.matcher(color.trim()).matches();
    }

    private String toJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            return "{}";
        }
    }
}
