package com.puff.tech.usecase.staffsalary.get;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

import java.math.BigDecimal;
import java.time.Instant;

@Serdeable
public record GetStaffSalaryUseCaseResponse(
        Integer id,
        Integer staffId,
        Integer month,
        Integer year,
        Instant selectedDate,
        Boolean isSlideOn,
        Instant calculationDate,
        String salaryType,
        BigDecimal amount,
        String permission,
        Instant createdAt,
        Instant updatedAt
)
implements UseCase.UseCaseResponse {
}
