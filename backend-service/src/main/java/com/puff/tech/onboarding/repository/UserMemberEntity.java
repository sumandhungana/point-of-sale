package com.puff.tech.onboarding.repository;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.data.annotation.*;
import io.micronaut.serde.annotation.Serdeable;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;


@MappedEntity("user_members")
@Serdeable
@Introspected
@Getter
@Setter
public class UserMemberEntity {
    @Id
    @GeneratedValue(GeneratedValue.Type.AUTO)
    private Long id;

    @Relation(Relation.Kind.MANY_TO_ONE)
    private UserInfoEntity user;

    @Relation(Relation.Kind.MANY_TO_ONE)
    private MemberEntity member;

    @DateCreated
    private Instant createdAt;

    private String createdBy;

}
