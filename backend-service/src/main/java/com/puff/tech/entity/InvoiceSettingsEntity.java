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
@Introspected
@Serdeable
@MappedEntity(value="InvoiceSettings")
public class InvoiceSettingsEntity {

    @Id
    @Generated
    private Integer id;
    private Integer khataBookId;

    @Relation(Relation.Kind.MANY_TO_ONE)
    private KhataBookEntity khataBook;

    //bills field
    private String premiumBill;
    private String thermalBill;
    private String basicBill;

    private String regularPrinterField1;
    private String regularPrinterField2;
    private String regularPrinterField3;

    private String thermalPrinterField1;
    private String thermalPrinterField2;
    private String thermalPrinterField3;

    private boolean showCompanyName= false;
    private boolean showCompanyLogo= false;
    private boolean showAddress= false;
    private boolean showEmail= false;
    private boolean showPhone= false;
    private boolean showPanVat= false;

    private String companyName;
    private String companyLogo;
    private String address;
    private String email;
    private String phone;
    private String panVat;

    private boolean showAuthorizedSignature= false;
    private String authorizedSignatureText;
    private String changeSignature;

    private String paperSize;
    private String orientation;
    private String companyTextSize;
    private String invoiceTextSize;

    @DateCreated
    private Instant createdAt;

    @DateUpdated
    private Instant updatedAt;

}
