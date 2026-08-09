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
@Introspected
@Serdeable
@MappedEntity(value = "Categories")
public class CategoryEntity {

    @Id
    @Generated
    private Integer id;
    private Integer khataBookId;

    @Relation(Relation.Kind.MANY_TO_ONE)
    private KhataBookEntity khataBook;
    private String name;
    private String description;
    private Integer categoryType=0; // 0: General, 1: Income, 2: Expense, 3: Purchase, 4: Cashbook
    @DateCreated
    private Instant createdAt;
    @DateUpdated
    private Instant updatedAt;
}
