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
@MappedEntity(value = "PaymentGateways")
public class PaymentGatewayEntity {
    @Id
    @Generated
    private Integer id;
    private Integer khataBookId;
    @Relation(Relation.Kind.MANY_TO_ONE)
    private KhataBookEntity khataBook;

    private String name;
    private String paymentMode;
    private String description;
    private boolean isActive=false;
    private String imagePath;
    private String verificationUrl;
    private String publicKey;
    private String secretKey;

    @DateCreated
    private Instant createdAt;
    @DateUpdated
    private Instant updatedAt;
}
