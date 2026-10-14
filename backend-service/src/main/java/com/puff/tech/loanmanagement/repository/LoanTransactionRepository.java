package com.puff.tech.loanmanagement.repository;

import io.micronaut.data.annotation.Query;
import io.micronaut.data.model.query.builder.sql.Dialect;
import io.micronaut.data.r2dbc.annotation.R2dbcRepository;
import io.micronaut.data.repository.reactive.ReactorCrudRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@R2dbcRepository(dialect = Dialect.POSTGRES)
public interface LoanTransactionRepository extends ReactorCrudRepository<LoanTransactionEntity, Long> {

    @Query("SELECT * FROM loan_transactions WHERE loan_id = :loanId ORDER BY transaction_date DESC, created_at DESC")
    Flux<LoanTransactionEntity> findByLoanIdOrderByTransactionDateDesc(Long loanId);

    @Query("SELECT * FROM loan_transactions WHERE member_id = :memberId ORDER BY transaction_date DESC, created_at DESC")
    Flux<LoanTransactionEntity> findByMemberIdOrderByTransactionDateDesc(Long memberId);

    @Query("DELETE FROM loan_transactions WHERE loan_id = :loanId")
    Mono<Long> deleteByLoanId(Long loanId);
}
