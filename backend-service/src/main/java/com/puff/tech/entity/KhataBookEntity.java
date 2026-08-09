package com.puff.tech.entity;

import com.puff.tech.domain.BusinessCategory;
import com.puff.tech.domain.BusinessType;
import io.micronaut.core.annotation.Generated;
import io.micronaut.core.annotation.Introspected;
import io.micronaut.data.annotation.DateCreated;
import io.micronaut.data.annotation.DateUpdated;
import io.micronaut.data.annotation.Id;
import io.micronaut.data.annotation.MappedEntity;
import io.micronaut.serde.annotation.Serdeable;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Serdeable
@Introspected
@MappedEntity(value = "KhataBooks")
public class KhataBookEntity {

    @Id
    @Generated
    private Integer id;

    private String name;
    private String number;
    private String address;
    private String email;
    private String companyName;
    private String companyNumber;
    private String companyAddress;
    private String companyEmail;
    private boolean taxVat;
    private BusinessCategory businesscategory;
    private BusinessType businessType;
    private String bookAccount;
    private boolean kyc;
    private String imagePath;
    private boolean isUsed= false;

    @DateCreated
    private Instant createdAt;

    @DateUpdated
    private Instant updatedAt;


}
