package com.puff.tech.rentalitem.repository;

import com.puff.tech.onboarding.repository.MemberEntity;
import io.micronaut.core.annotation.Introspected;
import io.micronaut.data.annotation.*;
import io.micronaut.serde.annotation.Serdeable;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;

@Getter
@Setter
@Serdeable
@Introspected
@MappedEntity(value = "rental_item")
public class RentalItemEntity {
    @Id
    @GeneratedValue(GeneratedValue.Type.AUTO)
    private Long id;

    @Relation(Relation.Kind.MANY_TO_ONE)
    private MemberEntity member;

    private String rentalItemName;
    private String phoneNumber;
    private String address;

    private BigDecimal rentalAmount;
    private String rentalPeriod; // e.g., Daily, Weekly, Monthly

    private LocalDateTime startDate;
    private LocalDateTime endDate;

    private String remarks;

    @DateCreated
    private Instant createdAt;

    @DateUpdated
    private Instant updatedAt;

    private String createdBy;
    private String updatedBy;
}
