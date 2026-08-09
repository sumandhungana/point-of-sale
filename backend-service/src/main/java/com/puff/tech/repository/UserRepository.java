package com.puff.tech.repository;

import com.puff.tech.entity.UserEntity;
import io.micronaut.data.model.query.builder.sql.Dialect;
import io.micronaut.data.r2dbc.annotation.R2dbcRepository;
import io.micronaut.data.repository.reactive.ReactorCrudRepository;
import reactor.core.publisher.Mono;

@R2dbcRepository(
        dialect = Dialect.POSTGRES
)
public interface UserRepository extends ReactorCrudRepository<UserEntity, Integer> {
    Mono<UserEntity> findByUserName(String userName);
    Mono<UserEntity> findByIdAndUserName(int id, String userName);
}
