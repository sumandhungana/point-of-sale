package com.puff.tech.staffmanagement.repository;

import com.puff.tech.onboarding.repository.MemberEntity;
import io.micronaut.data.annotation.Join;
import io.micronaut.data.model.query.builder.sql.Dialect;
import io.micronaut.data.r2dbc.annotation.R2dbcRepository;
import io.micronaut.data.repository.reactive.ReactorCrudRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@R2dbcRepository(
        dialect = Dialect.POSTGRES
)
public interface OrganizationStaffRepository extends ReactorCrudRepository<OrganizationStaffEntity,Integer> {
//    Flux<OrganizationStaffEntity> findByMemberIdOrderByCreatedAtDesc(Long memberId);
    Mono<OrganizationStaffEntity> findByIdAndMemberId(Integer id, Long memberId);
    // Eagerly join salaries when querying staff
    @Join(value = "salaries", type = Join.Type.LEFT)
    @Join(value = "attendances", type = Join.Type.LEFT)
    Flux<OrganizationStaffEntity> findByMemberIdOrderByCreatedAtDesc(Long memberId);
}