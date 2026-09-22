package com.puff.tech.staffmanagement.usecase.staff.get;

import io.micronaut.serde.annotation.Serdeable;
import java.math.BigDecimal;
import java.time.Instant;

@Serdeable
public record StaffSalaryResponse(
        Integer id,
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
) {}
