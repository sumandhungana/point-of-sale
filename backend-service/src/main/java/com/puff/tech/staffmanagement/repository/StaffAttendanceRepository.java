package com.puff.tech.staffmanagement.repository;

import io.micronaut.data.model.query.builder.sql.Dialect;
import io.micronaut.data.r2dbc.annotation.R2dbcRepository;
import io.micronaut.data.repository.reactive.ReactorCrudRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Instant;

@R2dbcRepository(
        dialect = Dialect.POSTGRES
)
public interface StaffAttendanceRepository extends ReactorCrudRepository<StaffAttendanceEntity,Integer> {

    Flux<StaffAttendanceEntity> findByMemberIdOrderByDateDesc(Integer MemberId);

    Mono<StaffAttendanceEntity> findByIdAndMemberId(Integer id, Integer MemberId);

    Flux<StaffAttendanceEntity> findByStaffIdAndMemberIdOrderByDateDesc(
            Integer staffId,
            Integer MemberId
    );
    Flux<StaffAttendanceEntity> findByDateAndMemberIdOrderByStaffIdAsc(
            Instant date,
            Integer MemberId
    );

    Mono<StaffAttendanceEntity> findByStaffIdAndDateAndMemberId(
            Integer staffId,
            Instant date,
            Integer MemberId
    );
    Mono<Boolean> existsByIdAndMemberId(Integer id, Integer MemberId);

    Mono<Void> deleteByIdAndMemberId(Integer id, Integer MemberId);
}
