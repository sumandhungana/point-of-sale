package com.puff.tech.inventorymanagement.repository;

import io.micronaut.data.annotation.Join;
import io.micronaut.data.annotation.Query;
import io.micronaut.data.model.query.builder.sql.Dialect;
import io.micronaut.data.r2dbc.annotation.R2dbcRepository;
import io.micronaut.data.repository.reactive.ReactorCrudRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@R2dbcRepository(dialect = Dialect.POSTGRES)
public interface ProductRepository extends ReactorCrudRepository<ProductEntity, Long> {
    @Join(value = "category", type = Join.Type.LEFT_FETCH)
    Flux<ProductEntity> findByMemberId(Long memberId);

    @Query("""
        UPDATE products 
        SET item_count = item_count - :quantity 
        WHERE id = :productId 
          AND member_id = :memberId 
          AND item_count >= :quantity
    """)
    Mono<Long> decrementStock(Long productId, Long memberId, Double quantity);
}
