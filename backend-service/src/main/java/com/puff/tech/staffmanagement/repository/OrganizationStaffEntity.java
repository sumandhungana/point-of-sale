package com.puff.tech.staffmanagement.repository;

import com.puff.tech.onboarding.repository.MemberEntity;
import io.micronaut.core.annotation.Introspected;
import io.micronaut.data.annotation.*;
import io.micronaut.serde.annotation.Serdeable;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;


@Getter
@Setter
@Serdeable
@Introspected
@MappedEntity(value = "organization_staff", escape = true)
public class OrganizationStaffEntity {
    @Id
    @GeneratedValue(GeneratedValue.Type.IDENTITY)
    private Integer id;

    private String name;

    private String address;

    private String phone;

    private String email;

    private String remarks;

    private String profileImageUrl;

    @Relation(Relation.Kind.MANY_TO_ONE)
    private MemberEntity member;

    @DateCreated
    private Instant createdAt;

    @DateUpdated
    private Instant updatedAt;

    @Relation(value = Relation.Kind.ONE_TO_MANY, mappedBy = "staff", cascade = Relation.Cascade.ALL)
    private List<StaffSalaryEntity> salaries = new ArrayList<>();

    @Relation(value = Relation.Kind.ONE_TO_MANY, mappedBy = "staff", cascade = Relation.Cascade.ALL)
    private List<StaffAttendanceEntity> attendances = new ArrayList<>();
}

