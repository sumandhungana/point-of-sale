package com.puff.tech.appsetting.usecase.request;

import com.puff.tech.core.usecases.UCResponse;
import io.micronaut.serde.annotation.Serdeable;
import lombok.Builder;

import java.time.Instant;

@Serdeable
@Builder
public record AppSettingUCDto(
        Long id,
        Long memberId,

        String sideMenuBgColor,
        String sideMenuBgEndColor,
        String sideMenuFontColor,
        String sideMenuHoverFontColor,
        String sideMenuHoverBgColor,

        String topMenuBgColor,
        String topMenuFontColor,

        String appBgColor,
        String appForegroundColor,

        String logoPath,
        String faviconPath,
        String loginBgPath,

        String currency,
        String currencyPosition,
        String dateFormat,
        String timeFormat,
        String numberFormat,
        String language,

        String updatedBy,
        Instant createdAt,
        Instant updatedAt
) implements UCResponse {
}
