package com.puff.tech.inventorymanagement.repository;

import com.puff.tech.onboarding.repository.MemberEntity;
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
@MappedEntity(value = "categories")
public class CategoriesEntity {
    @Id
    @GeneratedValue(GeneratedValue.Type.AUTO)
    Long id;

    @Relation(Relation.Kind.MANY_TO_ONE)
    private MemberEntity member;
    private String name;
    private String description;
    private Integer categoryType=0; // 0: General, 1: Income, 2: Expense, 3: Purchase, 4: Cashbook
    @DateCreated
    private Instant createdAt;
    @DateUpdated
    private Instant updatedAt;
    private String createdBy;
    private String updatedBy;
}
