package com.puff.tech.repository;

import com.puff.tech.entity.PaymentHistoryEntity;
import io.micronaut.data.model.query.builder.sql.Dialect;
import io.micronaut.data.r2dbc.annotation.R2dbcRepository;
import io.micronaut.data.repository.reactive.ReactorCrudRepository;

@R2dbcRepository(
        dialect = Dialect.POSTGRES
)
public interface PaymentHistoryRepository extends ReactorCrudRepository<PaymentHistoryEntity,Integer> {
}
