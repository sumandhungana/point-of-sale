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
@MappedEntity(value = "SalesBillItems")
public class SalesBillItemEntity {

    @Id
    @Generated
    private Integer id;
    private Integer khataBookId;

    @Relation(Relation.Kind.MANY_TO_ONE)
    private KhataBookEntity khataBook;


    private Integer salesBillId;

    @Relation(Relation.Kind.MANY_TO_ONE)
    private SalesBillEntity salesBill;
    private Integer itemId;

    @Relation(Relation.Kind.MANY_TO_ONE)
    private ItemEntity item;
    private BigDecimal quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;

    private BigDecimal discount;

    private BigDecimal tax;

    private BigDecimal finalPrice;

    @DateCreated
    private Instant createdAt;

    @DateUpdated
    private Instant updatedAt;
}
