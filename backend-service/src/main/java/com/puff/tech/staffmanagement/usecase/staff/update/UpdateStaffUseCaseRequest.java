package com.puff.tech.staffmanagement.usecase.staff.update;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record UpdateStaffUseCaseRequest(
        Integer id,
        String name,
        String phone,
        String address,
        String email,
        String remarks,
        String profileImageUrl
) implements UseCases.UseCaseRequest {
}
