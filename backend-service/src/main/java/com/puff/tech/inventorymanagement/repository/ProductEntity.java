package com.puff.tech.inventorymanagement.repository;

import com.puff.tech.customermanagement.repository.OrganizationCustomerEntity;
import com.puff.tech.onboarding.repository.MemberEntity;
import com.puff.tech.suppliermanagement.repository.SupplierEntity;
import io.micronaut.core.annotation.Introspected;
import io.micronaut.core.annotation.Nullable;
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
@MappedEntity(value = "products")
public class ProductEntity {

    @Id
    @GeneratedValue(GeneratedValue.Type.AUTO)
    private Long id;

    private String name;

    @Relation(Relation.Kind.MANY_TO_ONE)
    private CategoriesEntity category;

    @Relation(Relation.Kind.MANY_TO_ONE)
    private MemberEntity member;

    @Relation(Relation.Kind.MANY_TO_ONE)
    private OrganizationCustomerEntity customer;

    @Relation(Relation.Kind.MANY_TO_ONE)
    private SupplierEntity supplier;

    private Double itemCount;

    private String unit;

    private BigDecimal perUnitPurchasePrice;

    private BigDecimal grossPurchasePrice;

    private BigDecimal salesPrice;
    @Nullable
    @MappedProperty(value = "is_tax_included")
    private boolean taxIncluded;
    @Nullable
    private Double openingStock;
    @Nullable
    private Double countStock;
    @Nullable
    private Double lowStockAlert;
    @Nullable
    private Double vatPercentage;
    @Nullable
    private LocalDate vatDate;
    @Nullable
    private String imageUrl;

    @DateCreated
    private Instant createdAt;
    private String createdBy;

    @DateUpdated
    private Instant updatedAt;
    private String updatedBy;

}
