package com.puff.tech.inventorymanagement.repository;

import com.puff.tech.customermanagement.repository.OrganizationCustomerEntity;
import com.puff.tech.onboarding.repository.MemberEntity;
import io.micronaut.core.annotation.Introspected;
import io.micronaut.core.annotation.Nullable;
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
@Serdeable
@Introspected
@MappedEntity(value = "sales_bill")
public class SalesBillEntity {
    @Id
    @GeneratedValue(GeneratedValue.Type.SEQUENCE)
    private Long id;

    private String billNumber;

    private LocalDate billDate;

    @Relation(Relation.Kind.MANY_TO_ONE)
    private ProductEntity product;

    @Nullable
    @Relation(Relation.Kind.MANY_TO_ONE)
    private OrganizationCustomerEntity customer;

    @Nullable
    private String customerName;

    @Relation(Relation.Kind.MANY_TO_ONE)
    private MemberEntity member;

    @Size(max = 20)
    private String paymentMode;

    private Double quantity;

    private BigDecimal unitPrice;

    @Nullable
    private Double taxPercentage;

    @Nullable
    private Double vatPercentage;

    @Nullable
    private BigDecimal taxAmount;

    @Nullable
    private BigDecimal vatAmount;

    private BigDecimal amount; // Line item final total price

    private String remarks;

    @Nullable
    @Size(max = 255)
    private String photoPath;

    @DateCreated
    private Instant createdAt;

    @DateUpdated
    private Instant updatedAt;

    private String createdBy;

    private String updatedBy;

}
