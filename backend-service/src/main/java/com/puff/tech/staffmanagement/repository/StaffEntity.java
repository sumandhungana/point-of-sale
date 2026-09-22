package com.puff.tech.staffmanagement.repository;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.data.annotation.*;
import io.micronaut.serde.annotation.Serdeable;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDate;

@Getter
@Setter
@Serdeable
@Introspected
@MappedEntity(value = "Staff", escape = true)
public class StaffEntity {
    @Id
    @GeneratedValue(GeneratedValue.Type.IDENTITY)
    private Integer id;

    @MappedProperty("Name")
    private String name;

    @MappedProperty("Address")
    private String address;

    @MappedProperty("Phone")
    private String phone;

    @MappedProperty("Email")
    private String email;

    @MappedProperty("Remarks")
    private String remarks;

    @MappedProperty("ProfileImageUrl")
    private String profileImageUrl;

    @MappedProperty("member_id")
    private String memberId;

    @MappedProperty("SalaryStartDate")
    private LocalDate salaryStartDate;

    @DateCreated
    @MappedProperty("CreatedAt")
    private Instant createdAt;

    @DateUpdated
    @MappedProperty("UpdatedAt")
    private Instant updatedAt;

//    @Relation(value = Relation.Kind.ONE_TO_MANY, cascade = Relation.Cascade.ALL)
//    private List<StaffSalaryEntity> staffSalaries = new ArrayList<>();

//    @Relation(value = Relation.Kind.ONE_TO_MANY, cascade = Relation.Cascade.ALL)
//    private List<StaffAttendanceEntity> staffAttendances = new ArrayList<>();
}
