package com.puff.tech.repository;

import com.puff.tech.entity.PaymentGatewayEntity;
import io.micronaut.data.model.query.builder.sql.Dialect;
import io.micronaut.data.r2dbc.annotation.R2dbcRepository;
import io.micronaut.data.repository.reactive.ReactorCrudRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@R2dbcRepository(
        dialect = Dialect.POSTGRES
)
public interface PaymentGatewayRepository extends ReactorCrudRepository<PaymentGatewayEntity,Integer> {

    Flux<PaymentGatewayEntity> findByKhataBookIdOrderByCreatedAtDesc(Integer khataBookId);

    Mono<PaymentGatewayEntity> findByIdAndKhataBookId(
            Integer id,
            Integer khataBookId
    );
}
