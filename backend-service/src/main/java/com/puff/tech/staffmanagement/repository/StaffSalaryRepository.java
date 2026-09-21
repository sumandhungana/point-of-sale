package com.puff.tech.staffmanagement.repository;

import com.puff.tech.entity.StaffSalaryEntity;
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
            WHERE khata_book_id = :khataBookId
            ORDER BY year DESC, month DESC
            """)
    Flux<StaffSalaryEntity> findAllByKhataBookId(Integer khataBookId);
    @Join(value = "staff")
    Mono<StaffSalaryEntity> findByIdAndKhataBookId(Integer id, Integer khataBookId);

    @Join(value = "staff")
    @Query("""
        SELECT * FROM staff_salaries
        WHERE staff_id = :staffId
        AND khata_book_id = :khataBookId
        ORDER BY year DESC, month DESC
        """)
    Flux<StaffSalaryEntity> findByStaffIdAndKhataBookId(
            Integer staffId,
            Integer khataBookId
    );

    Mono<Boolean> existsByIdAndKhataBookId(Integer id, Integer khataBookId);
}
