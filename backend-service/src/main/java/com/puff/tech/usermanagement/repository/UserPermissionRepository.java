package com.puff.tech.usermanagement.repository;
import io.micronaut.data.model.query.builder.sql.Dialect;
import io.micronaut.data.r2dbc.annotation.R2dbcRepository;
import io.micronaut.data.repository.reactive.ReactorCrudRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@R2dbcRepository(dialect = Dialect.POSTGRES)
public interface UserPermissionRepository extends ReactorCrudRepository<UserPermissionEntity, Integer> {

    // Find all permissions associated with a specific role
    Flux<UserPermissionEntity> findByRoleId(Integer roleId);

    // Bulk delete permissions when updating/re-assigning role permissions
    Mono<Long> deleteByRoleId(Integer roleId);
}