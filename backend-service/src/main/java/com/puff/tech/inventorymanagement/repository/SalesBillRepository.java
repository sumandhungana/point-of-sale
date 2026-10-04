package com.puff.tech.inventorymanagement.repository;

import io.micronaut.data.annotation.Join;
import io.micronaut.data.annotation.Query;
import io.micronaut.data.model.query.builder.sql.Dialect;
import io.micronaut.data.r2dbc.annotation.R2dbcRepository;
import io.micronaut.data.repository.reactive.ReactorCrudRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@R2dbcRepository(dialect = Dialect.POSTGRES)
public interface SalesBillRepository  extends ReactorCrudRepository<SalesBillEntity, Long> {
    /**
     * Executes lock acquisition and returns boolean true with OID 16.
     */
    @Query("SELECT true FROM pg_advisory_xact_lock(:memberId)")
    Mono<Boolean> acquireMemberLock(Long memberId);

    @Query("SELECT COALESCE(MAX(CAST(SPLIT_PART(bill_number, '-', 3) AS BIGINT)), 0) " +
            "FROM sales_bill " +
            "WHERE member_id = :memberId AND bill_number LIKE CONCAT('%BILL-', :memberId, '-%')")
    Mono<Long> findLastSequenceByMemberId(Long memberId);

    @Join(value = "customer", type = Join.Type.LEFT_FETCH)
    @Join(value = "product", type = Join.Type.LEFT_FETCH)
    Flux<SalesBillEntity> findByMemberId(Long memberId);
}
