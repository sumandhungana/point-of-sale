package com.puff.tech.repository;

import com.puff.tech.entity.CustomerEntity;
import io.micronaut.data.model.query.builder.sql.Dialect;
import io.micronaut.data.r2dbc.annotation.R2dbcRepository;
import io.micronaut.data.repository.reactive.ReactorCrudRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@R2dbcRepository(
        dialect = Dialect.POSTGRES
)
public interface CustomerRepository extends ReactorCrudRepository<CustomerEntity,Integer> {
    Flux<CustomerEntity> findByKhataBookIdAndSupplierOrderByCreatedAtDesc(Integer khataBookId, boolean supplier);

    Mono<CustomerEntity> findByIdAndKhataBookId(Integer id, Integer khataBookId);

}
