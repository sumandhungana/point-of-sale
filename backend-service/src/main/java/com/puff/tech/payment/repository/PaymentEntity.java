package com.puff.tech.payment.repository;

import com.puff.tech.customermanagement.repository.OrganizationCustomerEntity;
import com.puff.tech.onboarding.repository.MemberEntity;
import com.puff.tech.onboarding.repository.UserInfoEntity;
import com.puff.tech.payment.ValidPaymentParty;
import com.puff.tech.payment.enums.PaymentParty;
import com.puff.tech.payment.enums.PaymentCategory;
import com.puff.tech.payment.enums.PaymentType;
import com.puff.tech.staffmanagement.repository.OrganizationStaffEntity;
import com.puff.tech.suppliermanagement.repository.SupplierEntity;
import io.micronaut.core.annotation.Introspected;
import io.micronaut.core.annotation.Nullable;
import io.micronaut.data.annotation.*;
import io.micronaut.data.annotation.event.PrePersist;
import io.micronaut.data.annotation.event.PreUpdate;
import io.micronaut.data.model.DataType;
import io.micronaut.serde.annotation.Serdeable;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@Serdeable
@Introspected
@Getter
@Setter
@ValidPaymentParty
@MappedEntity(value = "payments")
public class PaymentEntity {

    @Id
    @GeneratedValue(GeneratedValue.Type.AUTO)
    private Long id;

    @NotNull
    @Relation(value = Relation.Kind.MANY_TO_ONE)
    @MappedProperty("member_id")
    private MemberEntity member;


    @NotNull
    @Relation(value = Relation.Kind.MANY_TO_ONE)
    @MappedProperty("user_id")
    private UserInfoEntity user;

    @NotNull
    @TypeDef(type = DataType.STRING)
    @MappedProperty("payment_party")
    private PaymentParty paymentParty; // CUSTOMER, SUPPLIER, AUDIT, STAFF

    @Nullable
    @Relation(value = Relation.Kind.MANY_TO_ONE)
    @MappedProperty("customer_id")
    private OrganizationCustomerEntity customer;

    @Nullable
    @Relation(value = Relation.Kind.MANY_TO_ONE)
    @MappedProperty("staff_id")
    private OrganizationStaffEntity staff;

    @Nullable
    @Relation(value = Relation.Kind.MANY_TO_ONE)
    @MappedProperty("supplier_id")
    private SupplierEntity supplier;

    @NotNull
    @Positive
    @MappedProperty("amount")
    private BigDecimal amount;

    @NotNull
    @TypeDef(type = DataType.STRING)
    @MappedProperty("payment_type")
    private PaymentType paymentType; // CARD, QR, CASH

    @NotNull
    @TypeDef(type = DataType.STRING)
    @MappedProperty("payment_category")
    private PaymentCategory paymentCategory; // GIVEN, RECEIVED

    @Nullable
    @Size(max = 512)
    @MappedProperty("bill_path")
    private String billPath;

    @Nullable
    @Size(max = 1000)
    @MappedProperty("remarks")
    private String remarks;

    @DateCreated
    @MappedProperty("created_at")
    private Instant createdAt;

    @Nullable
    @DateUpdated
    @MappedProperty("updated_at")
    private Instant updatedAt;

    @NotNull
    @MappedProperty("created_by")
    private String createdBy;

    @Nullable
    @MappedProperty("updated_by")
    private String updatedBy;

    /**
     * Life-cycle event hook to ensure foreign key integrity before persisting/updating.
     */
    @PrePersist
    @PreUpdate
    public void validatePartyRelations() {
        if (paymentParty == null) {
            return;
        }
        switch (paymentParty) {
            case CUSTOMER -> {
                if (customer == null) {
                    throw new IllegalArgumentException("Customer entity must not be null when PaymentParty is CUSTOMER");
                }
            }
            case SUPPLIER -> {
                if (supplier == null) {
                    throw new IllegalArgumentException("Supplier entity must not be null when PaymentParty is SUPPLIER");
                }
            }
            case STAFF -> {
                if (staff == null) {
                    throw new IllegalArgumentException("Staff entity must not be null when PaymentParty is STAFF");
                }
            }
            case AUDIT -> {
                // Additional logic if needed for AUDIT
            }
        }
    }
}
