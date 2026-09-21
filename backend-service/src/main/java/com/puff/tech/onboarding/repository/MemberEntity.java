package com.puff.tech.usermanagement.repository;
import io.micronaut.core.annotation.Introspected;
import io.micronaut.data.annotation.*;
import io.micronaut.serde.annotation.Serdeable;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@MappedEntity(value = "member")
@Serdeable
@Introspected
@Getter
@Setter
public class MemberEntity {
    @Id
    @GeneratedValue(GeneratedValue.Type.AUTO)
    private Long id;

    // Unique formatted identifier (e.g., "001", "002", "003")
    private String memberId;

    private String organizationName;
    private String panVatNumber;
    private String organizationType;
    private String branch;
    private String organizationAddress;
    private String notes;

    @DateCreated
    private Instant createdAt;

    @DateUpdated
    private Instant updatedAt;

    private String createdBy;
    private String updatedBy;
}
