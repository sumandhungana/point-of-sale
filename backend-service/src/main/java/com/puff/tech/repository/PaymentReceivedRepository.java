package com.puff.tech.repository;

import com.puff.tech.entity.PaymentReceivedEntity;
import io.micronaut.data.model.query.builder.sql.Dialect;
import io.micronaut.data.r2dbc.annotation.R2dbcRepository;
import io.micronaut.data.repository.CrudRepository;
import io.micronaut.data.repository.reactive.ReactorCrudRepository;

@R2dbcRepository(
        dialect = Dialect.POSTGRES
)
public interface PaymentReceivedRepository extends ReactorCrudRepository<PaymentReceivedEntity,Integer> {
}
