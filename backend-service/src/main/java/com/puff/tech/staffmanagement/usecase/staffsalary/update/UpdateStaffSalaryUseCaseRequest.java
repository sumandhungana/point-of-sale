package com.puff.tech.staffmanagement.usecase.staffsalary.update;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

import java.math.BigDecimal;
import java.time.Instant;

@Serdeable
public record UpdateStaffSalaryUseCaseRequest(
        Integer id,
        Integer staffId,
        Integer month,
        Integer year,
        Instant selectedDate,
        Boolean isSlideOn,
        Instant calculationDate,
        String salaryType,
        BigDecimal amount,
        String permission
) implements UseCases.UseCaseRequest {
}
