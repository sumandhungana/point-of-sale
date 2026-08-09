package com.puff.tech.repository;

import com.puff.tech.entity.CashBookEntity;
import io.micronaut.data.annotation.Query;
import io.micronaut.data.model.query.builder.sql.Dialect;
import io.micronaut.data.r2dbc.annotation.R2dbcRepository;
import io.micronaut.data.repository.reactive.ReactorCrudRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@R2dbcRepository(
        dialect = Dialect.POSTGRES
)
public interface CashBookRepository extends ReactorCrudRepository<CashBookEntity,Integer> {

    @Query("SELECT * FROM cash_book WHERE id = :id AND khata_book_id = :khataBookId")
    Mono<CashBookEntity> findByIdAndKhataBookId(Integer id, Integer khataBookId);

    // ✅ Get all by KhataBook (sorted like your .NET)
    @Query("SELECT * FROM cash_book WHERE khata_book_id = :khataBookId ORDER BY created_at DESC")
    Flux<CashBookEntity> findAllByKhataBookId(Integer khataBookId);
}
