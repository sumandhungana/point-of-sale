package com.puff.tech.repository;

import com.puff.tech.entity.ExpensesEntity;
import io.micronaut.data.annotation.Query;
import io.micronaut.data.model.query.builder.sql.Dialect;
import io.micronaut.data.r2dbc.annotation.R2dbcRepository;
import io.micronaut.data.repository.reactive.ReactorCrudRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@R2dbcRepository(
        dialect = Dialect.POSTGRES
)
public interface ExpensesRepository extends ReactorCrudRepository<ExpensesEntity,Integer> {
    Flux<ExpensesEntity> findByKhataBookIdOrderByCreatedAtDesc(Integer khataBookId);

//    Mono<ExpensesEntity> findTopByKhataBookIdOrderByCreatedAtDesc(Integer khataBookId);

    @Query("SELECT * FROM expenses WHERE khata_book_id = :khataBookId ORDER BY created_at DESC LIMIT 1")
    Mono<ExpensesEntity> findLatestExpense(Integer khataBookId);

    Mono<ExpensesEntity> findByIdAndKhataBookId(Integer id, Integer khataBookId);
}
