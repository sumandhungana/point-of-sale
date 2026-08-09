package com.puff.tech.entity;

import io.micronaut.core.annotation.Generated;
import io.micronaut.core.annotation.Introspected;
import io.micronaut.data.annotation.*;
import io.micronaut.serde.annotation.Serdeable;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
@Serdeable
@Introspected
@MappedEntity(value = "Services")
public class ServiceEntity {
    @Id
    @Generated
    private Integer id;

    private Integer khataBookId;

    @Relation(Relation.Kind.MANY_TO_ONE)
    private KhataBookEntity khataBook;
    private String serviceName;

    private BigDecimal price;

    private boolean taxIncluded = false;

    private BigDecimal taxIncludedAmount;


    private BigDecimal tax;

    private BigDecimal vat;

    private String imagePath;

    // -------- Timestamps --------
    @DateCreated
    private Instant createdAt;

    @DateUpdated
    private Instant updatedAt;
}
