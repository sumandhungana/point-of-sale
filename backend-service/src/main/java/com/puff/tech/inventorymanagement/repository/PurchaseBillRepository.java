package com.puff.tech.inventorymanagement.repository;

import io.micronaut.data.annotation.Query;
import io.micronaut.data.model.query.builder.sql.Dialect;
import io.micronaut.data.r2dbc.annotation.R2dbcRepository;
import io.micronaut.data.repository.reactive.ReactorCrudRepository;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;

@R2dbcRepository(dialect = Dialect.POSTGRES)
public interface PurchaseBillRepository extends ReactorCrudRepository<PurchaseBillEntity, Long> {
    @Query("SELECT COALESCE(SUM(pb.amount), 0) FROM purchase_bill pb WHERE pb.product_id = :productId AND pb.member_id = :memberId")
    Mono<BigDecimal> findTotalAmountByProductIdAndMemberId(Long productId, Long memberId);

    /**
     * Executes lock acquisition and returns boolean true with OID 16.
     */
    @Query("SELECT true FROM pg_advisory_xact_lock(:memberId)")
    Mono<Boolean> acquireMemberLock(Long memberId);

    @Query("SELECT COALESCE(MAX(CAST(SPLIT_PART(purchase_no, '-', 3) AS BIGINT)), 0) " +
            "FROM purchase_bill " +
            "WHERE member_id = :memberId AND purchase_no LIKE CONCAT('%BILL-', :memberId, '-%')")
    Mono<Long> findLastSequenceByMemberId(Long memberId);
}
