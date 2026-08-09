package com.puff.tech.repository;

import com.puff.tech.entity.KhataBookEntity;
import io.micronaut.data.annotation.Query;
import io.micronaut.data.model.query.builder.sql.Dialect;
import io.micronaut.data.r2dbc.annotation.R2dbcRepository;
import io.micronaut.data.repository.reactive.ReactorCrudRepository;
import reactor.core.publisher.Mono;

@R2dbcRepository(
        dialect = Dialect.POSTGRES
)
public interface KhataBookRepository extends ReactorCrudRepository<KhataBookEntity, Integer> {
    Mono<KhataBookEntity> findByUsedTrue();

     @Query("SELECT * FROM KhataBooks ORDER BY id ASC LIMIT 1")
    Mono<KhataBookEntity> findFirstKhataBook();

    @Query("UPDATE khata_book SET is_used = false")
    Mono<Integer> resetUsed();
}
