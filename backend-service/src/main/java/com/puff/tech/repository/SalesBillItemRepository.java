package com.puff.tech.repository;

import com.puff.tech.entity.SalesBillItemEntity;
import io.micronaut.data.annotation.Join;
import io.micronaut.data.annotation.Query;
import io.micronaut.data.model.query.builder.sql.Dialect;
import io.micronaut.data.r2dbc.annotation.R2dbcRepository;
import io.micronaut.data.repository.reactive.ReactorCrudRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;

@R2dbcRepository(
        dialect = Dialect.POSTGRES
)
public interface SalesBillItemRepository extends ReactorCrudRepository<SalesBillItemEntity,Integer> {

    @Join(value = "salesBill", type = Join.Type.FETCH)
    @Join(value = "item", type = Join.Type.FETCH)
    Flux<SalesBillItemEntity>
    findByKhataBookIdOrderByCreatedAtDesc(Integer khataBookId);

    @Join(value = "salesBill", type = Join.Type.FETCH)
    @Join(value = "item", type = Join.Type.FETCH)
    Mono<SalesBillItemEntity>
    findByIdAndKhataBookId(Integer id, Integer khataBookId);

    @Join(value = "salesBill", type = Join.Type.FETCH)
    @Join(value = "item", type = Join.Type.FETCH)
    Flux<SalesBillItemEntity>
    findBySalesBillIdAndKhataBookId(
            Integer salesBillId,
            Integer khataBookId
    );

    @Query("""
            SELECT COALESCE(SUM(final_price), 0)
            FROM SalesBillItems
            WHERE sales_bill_id = :salesBillId
            """)
    Mono<BigDecimal> calculateBillTotal(Integer salesBillId);
}
