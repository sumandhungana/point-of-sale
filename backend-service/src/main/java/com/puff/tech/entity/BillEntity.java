package com.puff.tech.entity;

import com.puff.tech.domain.BillStatus;
import io.micronaut.core.annotation.Introspected;
import io.micronaut.data.annotation.*;
import io.micronaut.serde.annotation.Serdeable;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@MappedEntity(value = "bills")
@Serdeable
@Introspected
@Getter
@Setter
public class BillEntity {

    @Id
    @GeneratedValue
    private Long billId;


    @MappedProperty("khata_book_id")
    private Long khataBookId;


    @Relation(Relation.Kind.MANY_TO_ONE)
    @MappedProperty("khata_book")
    private KhataBookEntity khataBook;

    @NotNull
    private Long customerId;

    @Relation(Relation.Kind.MANY_TO_ONE)
    @MappedProperty("customer_id")
    private CustomerEntity customer;

    @NotNull
    private LocalDate billDate;

    private LocalDate dueDate;

    @NotNull
    @MappedProperty(definition = "DECIMAL(10,2)")
    private BigDecimal totalAmount;

    @MappedProperty(definition = "DECIMAL(10,2)")
    private BigDecimal paidAmount = BigDecimal.ZERO;

    @Size(max = 20)
    private String status = String.valueOf(BillStatus.UNPAID);

    private Instant createdAt = Instant.now();

    private Instant updatedAt = Instant.now();
}
