package com.puff.tech.entity;

import io.micronaut.core.annotation.Generated;
import io.micronaut.core.annotation.Introspected;
import io.micronaut.data.annotation.*;
import io.micronaut.serde.annotation.Serdeable;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.*;

@Getter
@Setter
@Serdeable
@Introspected
@MappedEntity(value = "Staff")
public class StaffEntity {

    @Id
    @Generated
    private Integer id;

    private Integer khataBookId;

    @Relation(Relation.Kind.MANY_TO_ONE)
    private KhataBookEntity khataBook;

    private String name;
    private String address;
    private String phone;
    private String email;
    private String remarks;
    private String profileImageUrl;

    @DateCreated
    private Instant createdAt;

    @DateUpdated
    private Instant updatedAt;

    @Relation(value = Relation.Kind.ONE_TO_MANY, cascade = Relation.Cascade.ALL)
    private List<StaffSalaryEntity> staffSalaries = new ArrayList<>();

    @Relation(value = Relation.Kind.ONE_TO_MANY, cascade = Relation.Cascade.ALL)
    private List<StaffAttendanceEntity> staffAttendances = new ArrayList<>();
}
