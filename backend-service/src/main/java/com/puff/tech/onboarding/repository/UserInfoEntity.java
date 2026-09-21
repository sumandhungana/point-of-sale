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

    private String userName;
    private String userId;
    private String password;
    private String phoneNumber;
    private String gmail;
    private Boolean enable = true;
    private String permission = "USER";
    private String role = "ADMIN";

    @DateCreated
    private Instant createdAt;

    @DateUpdated
    private Instant updatedAt;

    private String createdBy;
    private String updatedBy;
}