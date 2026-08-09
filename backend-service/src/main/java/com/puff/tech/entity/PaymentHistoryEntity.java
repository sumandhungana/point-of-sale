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
import java.time.LocalDate;

@Getter
@Setter
@Introspected
@Serdeable
@MappedEntity(value = "PaymentHistory")
public class PaymentHistoryEntity {
    @Id
    @Generated
    private Integer id;
    private Integer partyId;
    private BigDecimal amount;
    private String remarks;
    private LocalDate date;
    private String billPath;
    private String type;
    private BigDecimal oldBalance;
    private BigDecimal newBalance;

    @DateCreated
    private Instant createdAt;
    @DateUpdated
    private Instant updatedAt;
}
