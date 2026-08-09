package com.puff.tech.repository;

import com.puff.tech.entity.PurchaseEntity;
import io.micronaut.data.annotation.Query;
import io.micronaut.data.model.query.builder.sql.Dialect;
import io.micronaut.data.r2dbc.annotation.R2dbcRepository;
import io.micronaut.data.repository.reactive.ReactorCrudRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@R2dbcRepository(
        dialect = Dialect.POSTGRES
)
public interface PurchaseRepository extends ReactorCrudRepository<PurchaseEntity,Integer> {
    Flux<PurchaseEntity> findByKhataBookIdOrderByCreatedAtDesc(Integer khataBookId);

    Mono<PurchaseEntity> findByIdAndKhataBookId(Integer id, Integer khataBookId);

    @Query("""
    SELECT * FROM purchase
    WHERE khata_book_id = :khataBookId
    ORDER BY created_at DESC
    LIMIT 1
""")
    Mono<PurchaseEntity> findLatestPurchase(Integer khataBookId);}
