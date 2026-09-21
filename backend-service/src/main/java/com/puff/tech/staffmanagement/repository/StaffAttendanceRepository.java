package com.puff.tech.staffmanagement.repository;

import com.puff.tech.entity.StaffAttendanceEntity;
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

    Flux<StaffAttendanceEntity> findByKhataBookIdOrderByDateDesc(Integer khataBookId);

    Mono<StaffAttendanceEntity> findByIdAndKhataBookId(Integer id, Integer khataBookId);

    Flux<StaffAttendanceEntity> findByStaffIdAndKhataBookIdOrderByDateDesc(
            Integer staffId,
            Integer khataBookId
    );
    Flux<StaffAttendanceEntity> findByDateAndKhataBookIdOrderByStaffIdAsc(
            Instant date,
            Integer khataBookId
    );

    Mono<StaffAttendanceEntity> findByStaffIdAndDateAndKhataBookId(
            Integer staffId,
            Instant date,
            Integer khataBookId
    );
    Mono<Boolean> existsByIdAndKhataBookId(Integer id, Integer khataBookId);

    Mono<Void> deleteByIdAndKhataBookId(Integer id, Integer khataBookId);
}
