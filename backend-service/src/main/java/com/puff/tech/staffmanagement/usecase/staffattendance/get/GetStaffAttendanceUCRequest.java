package com.puff.tech.staffmanagement.usecase.staffattendance.get;

import com.puff.tech.core.usecases.UCRequest;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record GetStaffAttendanceUCRequest(

) implements UCRequest {
}
