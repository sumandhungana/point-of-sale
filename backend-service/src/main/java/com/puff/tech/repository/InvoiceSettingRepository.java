package com.puff.tech.repository;

import com.puff.tech.entity.InvoiceSettingsEntity;
import io.micronaut.data.model.query.builder.sql.Dialect;
import io.micronaut.data.r2dbc.annotation.R2dbcRepository;
import io.micronaut.data.repository.reactive.ReactorCrudRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@R2dbcRepository(
        dialect = Dialect.POSTGRES
)
public interface InvoiceSettingRepository extends ReactorCrudRepository<InvoiceSettingsEntity,Integer> {
    Flux<InvoiceSettingsEntity> findByKhataBookIdOrderByCreatedAtDesc(Integer khataBookId);

    Mono<InvoiceSettingsEntity> findByIdAndKhataBookId(Integer id, Integer khataBookId);

    Mono<Boolean> existsByIdAndKhataBookId(Integer id, Integer khataBookId);
}
