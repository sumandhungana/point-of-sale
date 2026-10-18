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
@MappedEntity(value = "app_settings_audit")
public class AppSettingsAuditEntity {

    @Id
    @GeneratedValue(GeneratedValue.Type.IDENTITY)
    private Long id;

    private Long appSettingsId;
    @Relation(Relation.Kind.MANY_TO_ONE)
    private MemberEntity member;
    private String changedBy;

    @DateCreated
    private Instant changedAt;

    private String action;
    private String previousValues;
    private String newValues;
}
