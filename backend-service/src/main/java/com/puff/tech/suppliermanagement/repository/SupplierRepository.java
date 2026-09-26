package com.puff.tech.suppliermanagement.repository;

import com.puff.tech.suppliermanagement.repository.SupplierEntity;
import io.micronaut.data.model.query.builder.sql.Dialect;
import io.micronaut.data.r2dbc.annotation.R2dbcRepository;
import io.micronaut.data.repository.reactive.ReactorCrudRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@R2dbcRepository(
        dialect = Dialect.POSTGRES) // or your configured dialect
public interface SupplierRepository extends ReactorCrudRepository<SupplierEntity, Integer> {

    // Derived query: orders by createdAt descending for the given member ID
    Flux<SupplierEntity> findByMemberIdOrderByCreatedAtDesc(Long memberId);

    // Derived query: matches entity id and member.id
    Mono<SupplierEntity> findByIdAndMemberId(Integer id, Long memberId);

    // Derived query: checks existence by id and member.id
    Mono<Boolean> existsByIdAndMemberId(Integer id, Integer memberId);
}