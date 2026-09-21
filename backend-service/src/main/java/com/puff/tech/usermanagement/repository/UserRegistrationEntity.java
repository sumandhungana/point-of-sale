package com.puff.tech.usermanagement.repository;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.data.annotation.*;
import io.micronaut.serde.annotation.Serdeable;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;


@MappedEntity(value = "user_registrations")
@Serdeable
@Introspected
@Getter
@Setter
public class UserRegistrationEntity {
    @Id
    @GeneratedValue(GeneratedValue.Type.AUTO)
    private Long id;

    @Relation(Relation.Kind.ONE_TO_ONE)
    private UserInfoEntity user;

    private String userName;
    private String phoneNumber;
    private String gmail;
    private String organizationName;
    private String panVatNumber;
    private String organizationType;
    private String branch;
    private String organizationAddress;
    private String notes;
    // Automatic creation timestamp
    @DateCreated
    private Instant createdAt;

    // Automatic update timestamp
    @DateUpdated
    private Instant updatedAt;

    // Optional: User tracking fields if handled manually or via security listener
    private String createdBy;
    private String updatedBy;

}
