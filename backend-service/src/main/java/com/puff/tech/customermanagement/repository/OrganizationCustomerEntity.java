package com.puff.tech.customermanagement.repository;

import com.puff.tech.onboarding.repository.MemberEntity;
import io.micronaut.core.annotation.Introspected;
import io.micronaut.data.annotation.*;
import io.micronaut.data.model.DataType;
import io.micronaut.serde.annotation.Serdeable;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;


@Getter
@Setter
@Introspected
@Serdeable
@MappedEntity(value = "organization_customers", escape = true)
public class OrganizationCustomerEntity {
    @Id
    @GeneratedValue(GeneratedValue.Type.IDENTITY)
    @MappedProperty("id")
    private Integer id;

    @Relation(Relation.Kind.MANY_TO_ONE)
    private MemberEntity member;
    private String name;
    private String phone;
    private String email;
    private String address;
    private String company;
    private String pan;
    private String contactPerson;
    @MappedProperty("supplier")
    private boolean supplier;

    private String bankAccount;
    private BigDecimal cashBalance;
    @MappedProperty(type = DataType.STRING)
    private String profileImage;
    private boolean customerSmsSetting = false;
    private boolean smsLanguage = false;
    private boolean transactionHistoryCheck = false;
    private String createdBy;
    private String updatedBy;
    @DateCreated
    private Instant createdAt;

    @DateUpdated
    private Instant updatedAt;
}
