package com.puff.tech.inventorymanagement.repository;

import io.micronaut.data.model.query.builder.sql.Dialect;
import io.micronaut.data.r2dbc.annotation.R2dbcRepository;
import io.micronaut.data.repository.reactive.ReactorCrudRepository;
import reactor.core.publisher.Flux;

@R2dbcRepository(
        dialect = Dialect.POSTGRES
)
public interface CategoriesRepository extends ReactorCrudRepository<CategoriesEntity, Long> {

    Flux<CategoriesEntity> findByMemberId(Long memberId);
}
