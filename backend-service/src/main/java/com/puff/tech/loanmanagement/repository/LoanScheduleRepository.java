package com.puff.tech.loanmanagement.repository;

import io.micronaut.data.annotation.Query;
import io.micronaut.data.model.query.builder.sql.Dialect;
import io.micronaut.data.r2dbc.annotation.R2dbcRepository;
import io.micronaut.data.repository.reactive.ReactorCrudRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@R2dbcRepository(dialect = Dialect.POSTGRES)
public interface LoanScheduleRepository extends ReactorCrudRepository<LoanScheduleEntity, Long> {

    Flux<LoanScheduleEntity> findByLoanIdOrderByInstallmentNoAsc(Long loanId);

    Flux<LoanScheduleEntity> findByLoanIdAndStatusOrderByInstallmentNoAsc(Long loanId, String status);

    @Query("DELETE FROM loan_schedules WHERE loan_id = :loanId")
    Mono<Long> deleteByLoanId(Long loanId);
}
