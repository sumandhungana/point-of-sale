package com.puff.tech.usermanagement.repository;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.data.annotation.GeneratedValue;
import io.micronaut.data.annotation.Id;
import io.micronaut.data.annotation.MappedEntity;
import io.micronaut.data.annotation.Relation;
import io.micronaut.serde.annotation.Serdeable;
import lombok.Getter;
import lombok.Setter;

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
    private String password;
    private Boolean enable;
    private String permission  = "USER";
    private String role = "ADMIN";

//    @Relation(value = Relation.Kind.ONE_TO_ONE, mappedBy = "user")
//    private UserRegistrationEntity registrationInfo;
}