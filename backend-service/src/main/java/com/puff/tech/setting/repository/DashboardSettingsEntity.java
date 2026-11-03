package com.puff.tech.setting.repository;

import com.puff.tech.onboarding.repository.MemberEntity;
import io.micronaut.core.annotation.Introspected;
import io.micronaut.data.annotation.*;
import io.micronaut.data.model.DataType;
import io.micronaut.serde.annotation.Serdeable;
import io.r2dbc.postgresql.codec.Json;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Serdeable
@Introspected
@MappedEntity(value = "dashboard_settings")
public class DashboardSettingsEntity {

    @Id
    @GeneratedValue(GeneratedValue.Type.IDENTITY)
    private Long id;

    @Relation(Relation.Kind.MANY_TO_ONE)
    private MemberEntity member;

    private Integer roleId;

    private String roleName;

    private Integer roleOrder = 3;

    private String dashboardType = "admin";

    private Boolean enabled = true;

    @TypeDef(type = DataType.JSON)
    private String rowsConfig;

    private Boolean showSupplierChart = true;

    private Boolean showCustomerChart = true;

    private Boolean showInventoryChart = true;

    private Boolean showSystemMonitor = true;

    private String updatedBy;

    @DateCreated
    private Instant createdAt;

    @DateUpdated
    private Instant updatedAt;
}

