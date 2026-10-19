package com.puff.tech.staffmanagement.usecase.staffattendance.create;

import com.puff.tech.core.usecases.UCResponse;
import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record CreateStaffAttendanceUCResponse(
        String message
) implements UCResponse {
}
