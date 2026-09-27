package com.puff.tech.onboarding.repository;

import io.micronaut.data.annotation.Join;
import io.micronaut.data.model.query.builder.sql.Dialect;
import io.micronaut.data.r2dbc.annotation.R2dbcRepository;
import io.micronaut.data.repository.reactive.ReactiveStreamsCrudRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@R2dbcRepository(dialect = Dialect.POSTGRES)
public interface UserMemberRepository  extends ReactiveStreamsCrudRepository<UserMemberEntity, Long> {
//    // Find the primary/first organization linked to a user
    Flux<UserMemberEntity> findByUserId(Long user);

    // Option A: Use Micronaut's @Join annotation to eagerly load the member relation
    @Join(value = "member", type = Join.Type.FETCH)
    Mono<UserMemberEntity> findByUser(UserInfoEntity user);

    @Join(value = "user", type = Join.Type.FETCH)
    @Join(value = "member", type = Join.Type.FETCH)
    Mono<UserMemberEntity> findByUserIdAndMemberId(Long userId, Long memberId);
}
