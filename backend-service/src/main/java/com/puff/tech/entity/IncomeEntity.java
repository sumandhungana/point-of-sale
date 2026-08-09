package com.puff.tech.entity;

import io.micronaut.core.annotation.Generated;
import io.micronaut.core.annotation.Introspected;
import io.micronaut.data.annotation.DateCreated;
import io.micronaut.data.annotation.Id;
import io.micronaut.data.annotation.MappedEntity;
import io.micronaut.data.annotation.Relation;
import io.micronaut.serde.annotation.Serdeable;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Getter
@Setter
@Introspected
@Serdeable
@MappedEntity(value = "Incomes")
public class IncomeEntity {

    @Id
    @Generated
    private Integer id;
    private Integer khataBookId;

    @Relation(Relation.Kind.MANY_TO_ONE)
    private KhataBookEntity khataBook;

    private String incomeNo;
    private LocalDate date;
    private Integer categoryId;
    private Integer itemId;
    private String paymentMode;
    private BigDecimal amount;
    private String remarks;
    private String photoPath;
    @DateCreated
    private Instant createdAt;

    @Relation(Relation.Kind.MANY_TO_ONE)
    private CategoryEntity category;

    @Relation(Relation.Kind.MANY_TO_ONE)
    private ItemEntity item;
}
