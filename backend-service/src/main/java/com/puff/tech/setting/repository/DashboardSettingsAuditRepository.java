package com.puff.tech.setting.repository;

import io.micronaut.data.model.query.builder.sql.Dialect;
import io.micronaut.data.r2dbc.annotation.R2dbcRepository;
import io.micronaut.data.repository.reactive.ReactorCrudRepository;
import reactor.core.publisher.Flux;

@R2dbcRepository(dialect = Dialect.POSTGRES)
public interface DashboardSettingsAuditRepository extends ReactorCrudRepository<DashboardSettingsAuditEntity, Long> {

    Flux<DashboardSettingsAuditEntity> findByMemberIdOrderByChangedAtDesc(Long memberId);
}

