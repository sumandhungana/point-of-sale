package com.puff.tech.staffmanagement.usecase.staff.get;

import com.puff.tech.core.usecases.UCResponse;
import com.puff.tech.core.usecases.UseCase;
import com.puff.tech.staffmanagement.repository.StaffAttendanceEntity;
import com.puff.tech.staffmanagement.repository.StaffSalaryEntity;
import io.micronaut.serde.annotation.Serdeable;

import java.time.Instant;
import java.util.List;

@Serdeable
public record GetStaffUseCaseResponse(
        Integer id,
        String name,
        String phone,
        String address,
        String email,
        String remarks,
        String profileImageUrl,
        Instant createdAt,
        Instant updatedAt,
        List<StaffSalaryResponse> salaryResponses,
        List<StaffAttendanceResponse> attendanceResponses
)
implements UCResponse {
}

