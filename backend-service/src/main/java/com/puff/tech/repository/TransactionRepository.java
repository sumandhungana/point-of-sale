package com.puff.tech.repository;

import com.puff.tech.entity.TransactionEntity;
import io.micronaut.data.annotation.Query;
import io.micronaut.data.model.query.builder.sql.Dialect;
import io.micronaut.data.r2dbc.annotation.R2dbcRepository;
import io.micronaut.data.repository.reactive.ReactorCrudRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@R2dbcRepository(
        dialect = Dialect.POSTGRES
)
public interface TransactionRepository extends ReactorCrudRepository<TransactionEntity, Integer> {

    @Query("""
            SELECT * FROM transactions
            WHERE khata_book_id = :khataBookId
            ORDER BY created_at DESC
            """)
    Flux<TransactionEntity> findAllByKhataBookId(Integer khataBookId);

    Mono<TransactionEntity> findByIdAndKhataBookId(Integer id, Integer khataBookId);

    Mono<Boolean> existsByIdAndKhataBookId(Integer id, Integer khataBookId);
}
