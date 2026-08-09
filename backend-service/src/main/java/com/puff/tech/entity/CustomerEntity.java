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
@Introspected
@Serdeable
@MappedEntity(value = "Customers")
public class CustomerEntity {

    @Id
    @Generated
    private Integer id;

    private Integer khataBookId;
    @Relation(Relation.Kind.MANY_TO_ONE)
    private KhataBookEntity khataBookEntity;
    private String name;
    private String phone;
    private String email;
    private String address;
    private String company;
    private String pan;
    private String contactPerson;
    private boolean isSupplier;

    @DateCreated
    private Instant createdAt;

    @DateUpdated
    private Instant updatedAt;
    private String bankAccount;
    private BigDecimal cashBalance;
    private String profileImage;
    private boolean customerSmsSetting= false;
    private boolean smsLanguage= false;
    private boolean transactionHistoryCheck= false;
}
