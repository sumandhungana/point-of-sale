package com.puff.tech.entity;

import io.micronaut.core.annotation.Generated;
import io.micronaut.core.annotation.Introspected;
import io.micronaut.data.annotation.*;
import io.micronaut.serde.annotation.Serdeable;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Getter
@Setter
@Serdeable
@Introspected
@MappedEntity(value = "PaymentsReceived")
public class PaymentReceivedEntity {

    @Id
    @Generated
    private Integer id;
    private Integer khataBookId;
    @Relation(Relation.Kind.MANY_TO_ONE)
    private KhataBookEntity khataBook;

    private Integer partyId;

    @Relation(Relation.Kind.MANY_TO_ONE)
    private CustomerEntity party;

    private BigDecimal amount;
    private String remarks;
    private LocalDate date;
    private String billPath;
    @DateCreated
    private Instant createdAt;
    @DateUpdated
    private Instant updatedAt;
}
