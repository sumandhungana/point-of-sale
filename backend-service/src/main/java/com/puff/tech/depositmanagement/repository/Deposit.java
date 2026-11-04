package com.puff.tech.depositmanagement.repository;

import com.puff.tech.onboarding.repository.MemberEntity;
import com.puff.tech.payment.enums.PaymentParty;
import io.micronaut.core.annotation.Introspected;
import io.micronaut.data.annotation.*;
import io.micronaut.serde.annotation.Serdeable;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@MappedEntity(value = "deposit")
@Getter
@Setter
@Introspected
@Serdeable
public class Deposit {

    @Id
    @GeneratedValue(GeneratedValue.Type.AUTO)
    private long id;
    @NotNull
    @Relation(value = Relation.Kind.MANY_TO_ONE)
    @MappedProperty("member_id")
    private MemberEntity member;
    private PaymentParty paymentParty;
    private long partyId;
    private BigDecimal amount;
    private String remarks;
    private String createdBy;
    @DateCreated
    private Instant createdAt;
    private String updatedBy;
    @DateUpdated
    private Instant updatedAt;
}


