package com.puff.tech.staffmanagement.repository;

import com.puff.tech.domain.AttendanceStatus;
import com.puff.tech.entity.KhataBookEntity;
import com.puff.tech.onboarding.repository.MemberEntity;
import io.micronaut.core.annotation.Generated;
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
@MappedEntity(value = "staff_attendance")
public class StaffAttendanceEntity {

    @Id
    @Generated
    private Integer id;


    @Relation(Relation.Kind.MANY_TO_ONE)
    private MemberEntity member;


    @Relation(Relation.Kind.MANY_TO_ONE)
    private OrganizationStaffEntity staff;

    // -------- Attendance Info --------
    private AttendanceStatus status = AttendanceStatus.PRESENT; // present, absent, leave

    private Instant date;

    private String note;

    // -------- Timestamps --------
    @DateCreated
    private Instant createdAt;

    @DateUpdated
    private Instant updatedAt;
}
