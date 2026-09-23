package com.puff.tech.entity;

import com.puff.tech.customermanagement.repository.CustomerEntity;
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
@Serdeable
@Introspected
@MappedEntity(value = "SalesBills")
public class SalesBillEntity {
    @Id
    @Generated
    private Integer id;
    private Integer khataBookId;
    @Relation(Relation.Kind.MANY_TO_ONE)
    private KhataBookEntity khataBook;

    @Size(max = 100)
    private String billNumber;
    private LocalDate billDate;
    private Integer customerId;

    @Relation(Relation.Kind.MANY_TO_ONE)
    private CustomerEntity customer;

    @Size(max = 10)
    private String paymentMode;
    private BigDecimal amount;
    private String remarks;
    @Size(max = 255)
    private String photoPath;

    @DateCreated
    private Instant createdAt;

    @DateUpdated
    private Instant updatedAt;
}
