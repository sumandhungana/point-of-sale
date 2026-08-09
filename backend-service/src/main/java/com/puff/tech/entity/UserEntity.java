package com.puff.tech.entity;

import io.micronaut.core.annotation.Generated;
import io.micronaut.core.annotation.Introspected;
import io.micronaut.data.annotation.DateCreated;
import io.micronaut.data.annotation.DateUpdated;
import io.micronaut.data.annotation.Id;
import io.micronaut.data.annotation.MappedEntity;
import io.micronaut.serde.annotation.Serdeable;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@MappedEntity(value = "Users")
@Serdeable
@Introspected
@Getter
@Setter
public class UserEntity {

    @Id
    @Generated
    private Integer id;
    private String userName;
    private String password;
    private Boolean enable;
    private String branch;
    private String permission  = "user";
    private String parent;
    private String name;
    private String address;
    private String company;
    private String email;
    private String phone;
    private String pan;
    private String remarks;
    private String passwordHash;
    private String passwordSalt;

    @DateCreated
    private Instant createdAt;
    @DateUpdated
    private Instant updatedAt;
}
