package com.puff.tech.usermanagement.repository;

import io.micronaut.data.annotation.Join;
import io.micronaut.data.annotation.Query;
import io.micronaut.data.model.query.builder.sql.Dialect;
import io.micronaut.data.r2dbc.annotation.R2dbcRepository;
import io.micronaut.data.repository.reactive.ReactorCrudRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;

@R2dbcRepository(dialect = Dialect.POSTGRES)
public interface UserRoleRepository extends ReactorCrudRepository<UserRoleEntity, Integer> {

    // Fetch all roles for a specific member/organization
    Flux<UserRoleEntity> findByMemberId(Long memberId);

    // Eagerly join permissions when fetching a role by ID and memberId
    @Join(value = "permissions", type = Join.Type.LEFT)
    Mono<UserRoleEntity> findByIdAndMemberId(Integer id, Long memberId);

//    @Join(value = "permissions", type = Join.Type.LEFT_FETCH)
//    Mono<UserRoleEntity> findByIdAndPermissionsIn(Integer id, List<UserPermissionEntity> permissions);

    // Check if role name already exists for member
    Mono<Boolean> existsByNameAndMemberId(String name, Long memberId);

    @Join(value = "permissions", type = Join.Type.LEFT)
    Mono<UserRoleEntity> findByName(String name);

    @Join(value = "permissions", type = Join.Type.LEFT_FETCH)
    Mono<UserRoleEntity> findById(Integer id);
}
