package com.puff.tech.payment.repository;

import com.puff.tech.payment.enums.PaymentParty;
import io.micronaut.data.model.query.builder.sql.Dialect;
import io.micronaut.data.r2dbc.annotation.R2dbcRepository;
import io.micronaut.data.repository.reactive.ReactorCrudRepository;
import jakarta.validation.constraints.NotNull;
import reactor.core.publisher.Flux;


@R2dbcRepository(dialect = Dialect.POSTGRES)
public interface PaymentRepository extends ReactorCrudRepository<PaymentEntity, Long> {
    Flux<PaymentEntity> findByPaymentPartyAndCustomerIdOrderByCreatedAtDesc(@NotNull PaymentParty paymentParty, Integer customerId);
    Flux<PaymentEntity> findByPaymentPartyAndSupplierIdOrderByCreatedAtDesc(@NotNull PaymentParty paymentParty, Integer supplierId);
    Flux<PaymentEntity> findByPaymentPartyAndStaffIdOrderByCreatedAtDesc(@NotNull PaymentParty paymentParty, Integer staffId);
}
