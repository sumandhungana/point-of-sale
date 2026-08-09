package com.puff.tech.usecase.staff.create;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record CreateStaffUseCaseRequest(
        String name,
        String phone,
        String address,
        String email,
        String remarks,
        String profileImageUrl
)
implements UseCase.UseCaseRequest {
}
