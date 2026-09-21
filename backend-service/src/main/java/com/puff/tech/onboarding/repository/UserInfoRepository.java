package com.puff.tech.onboarding.repository;

import io.micronaut.data.model.query.builder.sql.Dialect;
import io.micronaut.data.r2dbc.annotation.R2dbcRepository;
import io.micronaut.data.repository.reactive.ReactiveStreamsCrudRepository;
import reactor.core.publisher.Mono;

@R2dbcRepository(dialect = Dialect.POSTGRES)
public interface UserInfoRepository extends ReactiveStreamsCrudRepository<UserInfoEntity, Long> {
    Mono<UserInfoEntity> findByUserName(String userName);
    Mono<UserInfoEntity> findByUserId(String userId);
}
