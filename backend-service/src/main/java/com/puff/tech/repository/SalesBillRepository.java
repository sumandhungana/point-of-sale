package com.puff.tech.repository;

import com.puff.tech.entity.SalesBillEntity;
import io.micronaut.data.annotation.Join;
import io.micronaut.data.model.query.builder.sql.Dialect;
import io.micronaut.data.r2dbc.annotation.R2dbcRepository;
import io.micronaut.data.repository.reactive.ReactorCrudRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@R2dbcRepository(
        dialect = Dialect.POSTGRES
)
public interface SalesBillRepository extends ReactorCrudRepository<SalesBillEntity,Integer> {

    @Join(value = "customer", type = Join.Type.FETCH)
    Flux<SalesBillEntity> findByKhataBookIdOrderByCreatedAtDesc(Integer khataBookId);

    @Join(value = "customer", type = Join.Type.FETCH)
    Mono<SalesBillEntity> findByIdAndKhataBookId(Integer id, Integer khataBookId);

    Mono<Boolean> existsByIdAndKhataBookId(Integer id, Long khataBookId);
}
