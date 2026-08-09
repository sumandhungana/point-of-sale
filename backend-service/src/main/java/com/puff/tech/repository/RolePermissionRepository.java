package com.puff.tech.repository;

import com.puff.tech.entity.RolePermissionEntity;
import io.micronaut.data.model.query.builder.sql.Dialect;
import io.micronaut.data.r2dbc.annotation.R2dbcRepository;
import io.micronaut.data.repository.reactive.ReactorCrudRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;

@R2dbcRepository(
        dialect = Dialect.POSTGRES
)
public interface RolePermissionRepository extends ReactorCrudRepository<RolePermissionEntity,Integer> {

    Mono<Boolean> existsByRoleIdAndPermissionId(Integer roleId, Integer permissionId);

    Flux<RolePermissionEntity> findByRoleIdAndPermissionIdIn(Integer roleId, List<Integer> permissionIds);
}
