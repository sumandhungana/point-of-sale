package com.puff.tech.depositmanagement.repository;

import com.puff.tech.payment.enums.PaymentParty;
import io.micronaut.data.model.query.builder.sql.Dialect;
import io.micronaut.data.r2dbc.annotation.R2dbcRepository;
import io.micronaut.data.repository.reactive.ReactorCrudRepository;
import reactor.core.publisher.Flux;

@R2dbcRepository(dialect = Dialect.POSTGRES)
public interface DepositRepository extends ReactorCrudRepository<Deposit, Long> {
    Flux<Deposit> findByPartyIdOrderByCreatedAtDesc(Long memberId);
}
