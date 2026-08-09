package com.puff.tech.entity;

import io.micronaut.core.annotation.Generated;
import io.micronaut.core.annotation.Introspected;
import io.micronaut.data.annotation.DateCreated;
import io.micronaut.data.annotation.DateUpdated;
import io.micronaut.data.annotation.Id;
import io.micronaut.data.annotation.MappedEntity;
import io.micronaut.serde.annotation.Serdeable;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
@Introspected
@Serdeable
@MappedEntity(value = "Products")
public class ProductEntity {

    @Id
    @Generated
    private Integer id;
    private String name;
    private String description;
    private BigDecimal price;
    private BigDecimal discount;
    private BigDecimal tax;
    private BigDecimal stockQuantity;
    private String imagePath;
    private boolean isActive= true;
    @DateCreated
    private Instant createdAt;
    @DateUpdated
    private Instant updatedAt;
}
