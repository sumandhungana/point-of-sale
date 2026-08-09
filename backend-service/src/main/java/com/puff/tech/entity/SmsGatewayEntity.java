package com.puff.tech.entity;

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
@MappedEntity(value = "SmsGateways")
public class SmsGatewayEntity {


    @Id
    @Generated
    private Integer id;

    private Integer khataBookId;

    @Relation(Relation.Kind.MANY_TO_ONE)
    private KhataBookEntity khataBook;

    private String partnerName;

    private boolean active = false;

    private String form;

    private String token;

    private String apiUrl;

    private String testSms;

    @DateCreated
    private Instant createdAt;

    @DateUpdated
    private Instant updatedAt;

}
