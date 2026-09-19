package com.puff.tech.usermanagement.repository;

import com.puff.tech.entity.UserEntity;
import io.micronaut.core.annotation.Introspected;
import io.micronaut.data.annotation.GeneratedValue;
import io.micronaut.data.annotation.Id;
import io.micronaut.data.annotation.MappedEntity;
import io.micronaut.data.annotation.Relation;
import io.micronaut.serde.annotation.Serdeable;
import lombok.Getter;
import lombok.Setter;


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

}
