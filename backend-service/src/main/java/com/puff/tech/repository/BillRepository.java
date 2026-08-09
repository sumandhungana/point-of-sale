package com.puff.tech.repository;

import com.puff.tech.entity.BillEntity;
import io.micronaut.data.annotation.Query;
import io.micronaut.data.model.query.builder.sql.Dialect;
import io.micronaut.data.r2dbc.annotation.R2dbcRepository;
import io.micronaut.data.repository.reactive.ReactorCrudRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@R2dbcRepository(
        dialect = Dialect.POSTGRES
)
public interface BillRepository extends ReactorCrudRepository<BillEntity,Integer> {
    Flux<BillEntity> findByKhataBookIdOrderByCreatedAtDesc(Mono<Integer> khataBookId);

    //  Get single bill
    Mono<BillEntity> findByBillIdAndKhataBookId(Integer billId, Integer khataBookId);

    //  Exists check
    Mono<Boolean> existsByBillIdAndKhataBookId(Integer billId, Integer khataBookId);

    //  Optional: JOIN with customer (replacement for EF Include)
    @Query("""
        SELECT b.* FROM bill b
        WHERE b.khata_book_id = :khataBookId
        ORDER BY b.created_at DESC
    """)
    Flux<BillEntity> findAllCustom(Integer khataBookId);
}
