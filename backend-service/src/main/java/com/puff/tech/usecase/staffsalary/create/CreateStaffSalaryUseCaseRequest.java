package com.puff.tech.usecase.staffsalary.create;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Serdeable
public record CreateStaffSalaryUseCaseRequest(
        Integer staffId,
        Integer month,
        Integer year,
        Instant selectedDate,
        Boolean isSlideOn,
        Instant calculationDate,
        String salaryType,
        BigDecimal amount,
        String permission
)
implements UseCase.UseCaseRequest {
}
