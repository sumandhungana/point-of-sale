package com.puff.tech.repository;

import com.puff.tech.entity.RoleEntity;
import io.micronaut.data.model.query.builder.sql.Dialect;
import io.micronaut.data.r2dbc.annotation.R2dbcRepository;
import io.micronaut.data.repository.reactive.ReactorCrudRepository;
import reactor.core.publisher.Flux;

@R2dbcRepository(
        dialect = Dialect.POSTGRES
)
public interface RoleRepository extends ReactorCrudRepository<RoleEntity,Integer> {
    Flux<RoleEntity> findAllOrderByCreatedAtDesc();
}
