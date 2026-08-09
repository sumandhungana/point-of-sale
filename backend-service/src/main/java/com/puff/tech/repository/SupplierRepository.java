package com.puff.tech.repository;

import com.puff.tech.entity.SupplierEntity;
import io.micronaut.data.annotation.Query;
import io.micronaut.data.model.query.builder.sql.Dialect;
import io.micronaut.data.r2dbc.annotation.R2dbcRepository;
import io.micronaut.data.repository.reactive.ReactorCrudRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@R2dbcRepository(
        dialect = Dialect.POSTGRES
)
public interface SupplierRepository extends ReactorCrudRepository<SupplierEntity,Integer> {
    @Query("""
            SELECT * FROM suppliers
            WHERE khata_book_id = :khataBookId
            ORDER BY created_at DESC
            """)
    Flux<SupplierEntity> findAllByKhataBookId(Integer khataBookId);

    Mono<SupplierEntity> findByIdAndKhataBookId(Integer id, Integer khataBookId);

    Mono<Boolean> existsByIdAndKhataBookId(Integer id, Integer khataBookId
    );
}
