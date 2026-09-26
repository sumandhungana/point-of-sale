package com.puff.tech.repository;

import com.puff.tech.entity.RoleEntity;
import io.micronaut.data.annotation.Join;
import io.micronaut.data.model.query.builder.sql.Dialect;
import io.micronaut.data.r2dbc.annotation.R2dbcRepository;
import io.micronaut.data.repository.reactive.ReactorCrudRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@R2dbcRepository(
        dialect = Dialect.POSTGRES
)
public interface RoleRepository extends ReactorCrudRepository<RoleEntity,Integer> {
    Flux<RoleEntity> findAllOrderByCreatedAtDesc();
    // Fetch Role with joined permissions eagerly to avoid N+1 queries in R2DBC
    @Join(value = "rolePermissions", type = Join.Type.LEFT)
    Mono<RoleEntity> findByName(String name);

    @Join(value = "rolePermissions", type = Join.Type.LEFT)
    Mono<RoleEntity> findById(Integer id);
}
