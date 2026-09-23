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
//    Mono<UserMemberEntity> findByUser(UserInfoEntity user);

    // Option A: Use Micronaut's @Join annotation to eagerly load the member relation
    @Join(value = "member", type = Join.Type.FETCH)
    Mono<UserMemberEntity> findByUser(UserInfoEntity user);

    // Find all organizations linked to a user (Many-to-Many)
    Flux<UserMemberEntity> findAllByUser(UserInfoEntity user);

    // Find user link by user ID
    Mono<UserMemberEntity> findByUserId(Long userId);

    // Find all users linked to a specific member/organization
    Flux<UserMemberEntity> findByMember(MemberEntity member);

    // Check if a link already exists between a user and an organization
    Mono<Boolean> existsByUserAndMember(UserInfoEntity user, MemberEntity member);

    // Delete a specific link between a user and a member
    Mono<Long> deleteByUserAndMember(UserInfoEntity user, MemberEntity member);
    @Join(value = "user", type = Join.Type.FETCH)
    @Join(value = "member", type = Join.Type.FETCH)
    Mono<UserMemberEntity> findByUserIdAndMemberId(Long userId, Long memberId);
}
