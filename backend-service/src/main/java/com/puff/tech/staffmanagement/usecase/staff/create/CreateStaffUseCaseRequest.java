package com.puff.tech.staffmanagement.usecase.staff.create;

import com.puff.tech.core.usecases.UCRequest;
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
implements UCRequest {
}
