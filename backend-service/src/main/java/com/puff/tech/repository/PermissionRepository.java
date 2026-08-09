package com.puff.tech.repository;

import com.puff.tech.entity.PermissionEntity;
import io.micronaut.data.model.query.builder.sql.Dialect;
import io.micronaut.data.r2dbc.annotation.R2dbcRepository;
import io.micronaut.data.repository.reactive.ReactorCrudRepository;
import reactor.core.publisher.Flux;

import java.util.List;

@R2dbcRepository(
        dialect = Dialect.POSTGRES
)
public interface PermissionRepository extends ReactorCrudRepository<PermissionEntity,Integer> {

    Flux<PermissionEntity> findAllOrderByCreatedAtDesc();

    Flux<PermissionEntity> findByModule(String module);

    Flux<PermissionEntity> findByIdIn(List<Integer> ids);


}
