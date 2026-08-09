package com.puff.tech.entity;

import io.micronaut.core.annotation.Generated;
import io.micronaut.core.annotation.Introspected;
import io.micronaut.data.annotation.*;
import io.micronaut.serde.annotation.Serdeable;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Getter
@Setter
@Introspected
@Serdeable
@MappedEntity(value = "Items")
public class ItemEntity {

    @Id
    @Generated
    private Integer id;
    private Integer khataBookId;

    @Relation(Relation.Kind.MANY_TO_ONE)
    private KhataBookEntity khataBook;

    private String name;
    @Size(max = 20)
    private String primaryUnit;
    @Size(max = 20)
    private String secondaryUnit;
    private boolean isSecondaryUnitEnabled= false;
    private Integer categoryId;

    @Relation(Relation.Kind.MANY_TO_ONE)
    private CategoryEntity category;
    private BigDecimal salesPrice;
    private BigDecimal purchasePrice;
    private boolean taxIncluded= false;
    private BigDecimal openingStock= BigDecimal.ZERO;
    private BigDecimal lowStockAlert;
    private BigDecimal vatPercentage;
    private BigDecimal vatPercentageToday;
    private LocalDate vatDate;
    private String imageUrl;

    @DateCreated
    private Instant createdAt;
    @DateUpdated
    private Instant updatedAt;
}
