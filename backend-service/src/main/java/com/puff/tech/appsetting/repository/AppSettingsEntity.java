package com.puff.tech.appsetting.repository;

import com.puff.tech.onboarding.repository.MemberEntity;
import io.micronaut.core.annotation.Introspected;
import io.micronaut.data.annotation.*;
import io.micronaut.serde.annotation.Serdeable;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Serdeable
@Introspected
@MappedEntity(value = "app_settings")
public class AppSettingsEntity {

    @Id
    @GeneratedValue(GeneratedValue.Type.IDENTITY)
    private Long id;


    @Relation(Relation.Kind.MANY_TO_ONE)
    private MemberEntity member;

    private String sideMenuBgColor = "#010A2E";
    private String sideMenuBgEndColor = "#06164A";
    private String sideMenuFontColor = "#ffffff";
    private String sideMenuHoverFontColor = "#ffffff";
    private String sideMenuHoverBgColor = "#495057";

    private String topMenuBgColor = "#ffffff";
    private String topMenuFontColor = "#212529";

    private String appBgColor = "#f8f9fa";
    private String appForegroundColor = "#212529";

    private String logoPath;
    private String faviconPath;
    private String loginBgPath;

    private String currency = "रु";
    private String currencyPosition = "before";
    private String dateFormat = "DD/MM/YYYY";
    private String timeFormat = "HH:mm";
    private String numberFormat = "1,234.56";
    private String language = "English";

    private String updatedBy;

    @DateCreated
    private Instant createdAt;

    @DateUpdated
    private Instant updatedAt;
}
