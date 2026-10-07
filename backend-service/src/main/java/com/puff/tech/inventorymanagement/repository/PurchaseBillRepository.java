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
}
