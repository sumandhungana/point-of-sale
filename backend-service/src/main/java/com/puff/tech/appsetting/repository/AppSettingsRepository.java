package com.puff.tech.appsetting.repository;

import io.micronaut.data.annotation.Query;
import io.micronaut.data.model.query.builder.sql.Dialect;
import io.micronaut.data.r2dbc.annotation.R2dbcRepository;
import io.micronaut.data.repository.reactive.ReactorCrudRepository;
import reactor.core.publisher.Mono;

@R2dbcRepository(dialect = Dialect.POSTGRES)
public interface AppSettingsRepository extends ReactorCrudRepository<AppSettingsEntity, Long> {

    Mono<AppSettingsEntity> findByMemberId(Long memberId);

    @Query("SELECT * FROM app_settings WHERE member_id = :memberId")
    Mono<AppSettingsEntity> findByMemberIdCustom(Long memberId);

    @Query("SELECT * FROM app_settings WHERE member_id IS NULL ORDER BY id ASC LIMIT 1")
    Mono<AppSettingsEntity> findGlobalDefault();

    Mono<Boolean> existsByMemberId(Long memberId);
}
