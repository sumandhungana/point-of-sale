package com.puff.tech.staffmanagement.repository;

import io.micronaut.data.annotation.Join;
import io.micronaut.data.annotation.Query;
import io.micronaut.data.model.query.builder.sql.Dialect;
import io.micronaut.data.r2dbc.annotation.R2dbcRepository;
import io.micronaut.data.repository.reactive.ReactorCrudRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@R2dbcRepository(
        dialect = Dialect.POSTGRES
)
public interface StaffSalaryRepository extends ReactorCrudRepository<StaffSalaryEntity,Integer> {

    @Join(value = "staff")
    @Query("""
            SELECT * FROM staff_salaries
            WHERE member_id = :MemberId
            ORDER BY year DESC, month DESC
            """)
    Flux<StaffSalaryEntity> findAllByMemberId(Integer MemberId);
    @Join(value = "staff")
    Mono<StaffSalaryEntity> findByIdAndMemberId(Integer id, Integer MemberId);

    @Join(value = "staff")
    @Query("""
        SELECT * FROM staff_salaries
        WHERE staff_id = :staffId
        AND khata_book_id = :MemberId
        ORDER BY year DESC, month DESC
        """)
    Flux<StaffSalaryEntity> findByStaffIdAndMemberId(
            Integer staffId,
            Integer MemberId
    );
}
