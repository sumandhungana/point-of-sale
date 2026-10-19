package com.puff.tech.staffmanagement.usecase.staffattendance.getbystaff;

import com.puff.tech.core.usecases.UCRequest;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record GetStaffAttendanceByStaffIdUCRequest(
        Long staffId
)implements UCRequest {
}
