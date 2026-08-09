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
@MappedEntity(value = "Transactions")
public class TransactionEntity {
    @Id
    @Generated
    private Integer id;
    private Integer khataBookId;

    @Relation(Relation.Kind.MANY_TO_ONE)
    private KhataBookEntity khataBook;
    private String description;
    private BigDecimal amount;
    private Instant transactionDate;
    private String transactionType;

    @DateCreated
    private Instant createdAt;

    @DateUpdated
    private Instant updatedAt;
}
