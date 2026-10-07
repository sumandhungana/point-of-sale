package com.puff.tech.inventorymanagement.repository;

import com.puff.tech.onboarding.repository.MemberEntity;
import com.puff.tech.suppliermanagement.repository.SupplierEntity;
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
@MappedEntity(value = "purchase_bill")
public class PurchaseBillEntity {
    @Id
    @GeneratedValue(GeneratedValue.Type.SEQUENCE)
    private Integer id;

    @Relation(Relation.Kind.MANY_TO_ONE)
    private ProductEntity product;

    @Relation(Relation.Kind.MANY_TO_ONE)
    private SupplierEntity supplier;

    private String supplierName; //RANDOM

    @Relation(Relation.Kind.MANY_TO_ONE)
    private MemberEntity member;

    private String purchaseNo;
    private LocalDate purchaseDate;

    private String paymentMode;

    private BigDecimal amount;

    private String remarks;

    private String photoPath;
    @DateCreated
    private Instant createdAt;
    @DateUpdated
    private Instant updatedAt;

    private String createdBy;

    private String updatedBy;
}
