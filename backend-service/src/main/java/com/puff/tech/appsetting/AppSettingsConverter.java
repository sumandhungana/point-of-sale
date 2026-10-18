package com.puff.tech.appsetting;

import com.puff.tech.appsetting.usecase.request.AppSettingUCDto;
import com.puff.tech.appsetting.repository.AppSettingsEntity;

public class AppSettingsConverter {

    public static AppSettingUCDto toDto(AppSettingsEntity entity) {
        if (entity == null) return null;
        return AppSettingUCDto.builder()
                .id(entity.getId())
                .memberId(entity.getMember() != null ? entity.getMember().getId() : null)
                .sideMenuBgColor(entity.getSideMenuBgColor())
                .sideMenuBgEndColor(entity.getSideMenuBgEndColor())
                .sideMenuFontColor(entity.getSideMenuFontColor())
                .sideMenuHoverFontColor(entity.getSideMenuHoverFontColor())
                .sideMenuHoverBgColor(entity.getSideMenuHoverBgColor())
                .topMenuBgColor(entity.getTopMenuBgColor())
                .topMenuFontColor(entity.getTopMenuFontColor())
                .appBgColor(entity.getAppBgColor())
                .appForegroundColor(entity.getAppForegroundColor())
                .logoPath(entity.getLogoPath())
                .faviconPath(entity.getFaviconPath())
                .loginBgPath(entity.getLoginBgPath())
                .currency(entity.getCurrency())
                .currencyPosition(entity.getCurrencyPosition())
                .dateFormat(entity.getDateFormat())
                .timeFormat(entity.getTimeFormat())
                .numberFormat(entity.getNumberFormat())
                .language(entity.getLanguage())
                .updatedBy(entity.getUpdatedBy())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
