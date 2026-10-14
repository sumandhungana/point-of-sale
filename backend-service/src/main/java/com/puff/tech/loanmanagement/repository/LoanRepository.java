package com.puff.tech.loanmanagement.repository;

import io.micronaut.data.annotation.Query;
import io.micronaut.data.model.query.builder.sql.Dialect;
import io.micronaut.data.r2dbc.annotation.R2dbcRepository;
import io.micronaut.data.repository.reactive.ReactorCrudRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@R2dbcRepository(dialect = Dialect.POSTGRES)
public interface LoanRepository extends ReactorCrudRepository<LoanEntity, Long> {

    Flux<LoanEntity> findByMemberIdOrderByCreatedAtDesc(Long memberId);

    Mono<LoanEntity> findByIdAndMemberId(Long id, Long memberId);

    Mono<Boolean> existsByIdAndMemberId(Long id, Long memberId);

    Mono<Long> countByMemberId(Long memberId);

    Mono<Long> countByMemberIdAndStatus(Long memberId, String status);

    @Query("DELETE FROM loans WHERE id = :id AND member_id = :memberId")
    Mono<Long> deleteByIdAndMemberId(Long id, Long memberId);
}
