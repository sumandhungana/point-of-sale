package com.puff.tech.appsetting.usecase.request;

import com.puff.tech.core.usecases.UCRequest;
import io.micronaut.serde.annotation.Serdeable;
import lombok.Builder;

@Builder
@Serdeable
public record UpdateAppSettingsUCRequest(
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
    String language
) implements UCRequest {
}
