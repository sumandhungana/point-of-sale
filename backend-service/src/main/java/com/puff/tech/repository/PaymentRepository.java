package com.puff.tech.repository;

import com.puff.tech.entity.PaymentEntity;
import io.micronaut.data.model.query.builder.sql.Dialect;
import io.micronaut.data.r2dbc.annotation.R2dbcRepository;
import io.micronaut.data.repository.reactive.ReactorCrudRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDate;

@R2dbcRepository(
        dialect = Dialect.POSTGRES
)
public interface PaymentRepository extends ReactorCrudRepository<PaymentEntity,Integer> {
    Flux<PaymentEntity> findByKhataBookIdOrderByPaymentDateDesc(Integer khataBookId);

    Mono<PaymentEntity> findByIdAndKhataBookId(Integer id, Integer khataBookId);

    Flux<PaymentEntity> findByPaymentDateAndKhataBookIdOrderByCreatedAtDesc(LocalDate paymentDate, Integer khataBookId);

    Flux<PaymentEntity> findByPaymentDateBetweenAndKhataBookIdOrderByPaymentDateDesc(LocalDate startDate, LocalDate endDate, Integer khataBookId);
}
