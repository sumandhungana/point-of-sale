package com.puff.tech.repository;

import com.puff.tech.entity.StaffEntity;
import io.micronaut.data.model.query.builder.sql.Dialect;
import io.micronaut.data.r2dbc.annotation.R2dbcRepository;
import io.micronaut.data.repository.reactive.ReactorCrudRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@R2dbcRepository(
        dialect = Dialect.POSTGRES
)
public interface StaffRepository extends ReactorCrudRepository<StaffEntity,Integer> {
    Flux<StaffEntity> findByKhataBookIdOrderByCreatedAtDesc(Integer khataBookId);

    Mono<StaffEntity> findByIdAndKhataBookId(Integer id, Integer khataBookId);

    Mono<Boolean> existsByIdAndKhataBookId(Integer id, Integer khataBookId);

    Mono<Void> deleteByIdAndKhataBookId(Integer id, Integer khataBookId);
}
