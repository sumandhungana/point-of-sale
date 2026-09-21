package com.puff.tech.usermanagement.repository;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.data.annotation.*;
import io.micronaut.serde.annotation.Serdeable;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Serdeable
@Introspected
@Getter
@Setter
@MappedEntity("user_info")
public class UserInfoEntity {

    @Id
    @GeneratedValue(GeneratedValue.Type.AUTO)
    private Long id;

    private String username;
    private String userId;
    private String password;
    private Boolean enable;
    private String permission  = "USER";
    private String role = "ADMIN";
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