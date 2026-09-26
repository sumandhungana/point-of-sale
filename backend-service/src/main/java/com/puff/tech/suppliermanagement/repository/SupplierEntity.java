package com.puff.tech.suppliermanagement.repository;

import com.puff.tech.entity.KhataBookEntity;
import com.puff.tech.onboarding.repository.MemberEntity;
import io.micronaut.core.annotation.Generated;
import io.micronaut.core.annotation.Introspected;
import io.micronaut.data.annotation.*;
import io.micronaut.data.model.DataType;
import io.micronaut.serde.annotation.Serdeable;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Serdeable
@Introspected
@MappedEntity(value = "suppliers")
public class SupplierEntity {
    @Id
    @GeneratedValue(GeneratedValue.Type.AUTO)
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
    @MappedProperty(type = DataType.STRING)
    private String profileImage;
    private String createdBy;
    private String updatedBy;

    // -------- Timestamps --------
    @DateCreated
    private Instant createdAt;

    @DateUpdated
    private Instant updatedAt;

}
