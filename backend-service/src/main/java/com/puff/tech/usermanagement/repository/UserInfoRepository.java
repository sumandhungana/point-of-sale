package com.puff.tech.usermanagement.repository;

import io.micronaut.data.model.query.builder.sql.Dialect;
import io.micronaut.data.r2dbc.annotation.R2dbcRepository;
import io.micronaut.data.repository.reactive.ReactiveStreamsCrudRepository;

@R2dbcRepository(dialect = Dialect.POSTGRES)
public interface UserInfoRepository extends ReactiveStreamsCrudRepository<UserInfoEntity, Long> {
}
