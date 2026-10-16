package com.puff.tech.rentalitem.repository;

import io.micronaut.data.model.query.builder.sql.Dialect;
import io.micronaut.data.r2dbc.annotation.R2dbcRepository;
import io.micronaut.data.repository.reactive.ReactorCrudRepository;
import reactor.core.publisher.Flux;

@R2dbcRepository(dialect = Dialect.POSTGRES)
public interface RentalItemRepository extends ReactorCrudRepository<RentalItemEntity, Long> {
    Flux<RentalItemEntity> findAllOrderByCreatedAtDesc();
}
