package com.puff.tech.entity;

import com.puff.tech.domain.AttendanceStatus;
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
@MappedEntity(value = "StaffAttendances")
public class StaffAttendanceEntity {

    @Id
    @Generated
    private Integer id;

    private Integer khataBookId;

    @Relation(Relation.Kind.MANY_TO_ONE)
    private KhataBookEntity khataBook;

    private Integer staffId;

    @Relation(Relation.Kind.MANY_TO_ONE)
    private StaffEntity staff;

    // -------- Attendance Info --------
    private AttendanceStatus status = AttendanceStatus.ABSENT; // present, absent, leave

    private Instant date;

    private String note;

    // -------- Timestamps --------
    @DateCreated
    private Instant createdAt;

    @DateUpdated
    private Instant updatedAt;
}
