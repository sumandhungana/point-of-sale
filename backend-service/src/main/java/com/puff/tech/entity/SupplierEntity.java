package com.puff.tech.entity;

import io.micronaut.core.annotation.Generated;
import io.micronaut.core.annotation.Introspected;
import io.micronaut.data.annotation.*;
import io.micronaut.serde.annotation.Serdeable;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Serdeable
@Introspected
@MappedEntity(value = "Suppliers")
public class SupplierEntity {
    @Id
    @Generated
    private Integer id;
    private Integer khataBookId;

    @Relation(Relation.Kind.MANY_TO_ONE)
    private KhataBookEntity khataBook;
    private String name;
    private String phone;
    private String email;
    private String address;
    private String company;
    private String pan;
    private String contactPerson;
    private String profileImage;

    // -------- Timestamps --------
    @DateCreated
    private Instant createdAt;

    @DateUpdated
    private Instant updatedAt;

}
