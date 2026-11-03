package com.puff.tech.setting.repository;

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
@MappedEntity(value = "dashboard_settings_audit")
public class DashboardSettingsAuditEntity {

    @Id
    @GeneratedValue(GeneratedValue.Type.IDENTITY)
    private Long id;

    private Long dashboardSettingsId;

    @Relation(Relation.Kind.MANY_TO_ONE)
    private MemberEntity member;

    private String roleName;

    private Integer roleOrder;

    private String changedBy;

    @DateCreated
    private Instant changedAt;

    private String action;

    private String previousValues;

    private String newValues;
}

