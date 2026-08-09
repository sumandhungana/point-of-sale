package com.puff.tech.usecase.staff.get;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

import java.time.Instant;

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
        Instant updatedAt
)
implements UseCase.UseCaseResponse {
}
