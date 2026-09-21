package com.puff.tech.usecase.supplier.get;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

import java.time.Instant;

@Serdeable
public record GetSupplierUseCaseResponse(
        Integer id,
        String name,
        String phone,
        String email,
        String address,
        String company,
        String pan,
        String contactPerson,
        String profileImage,
        Instant createdAt,
        Instant updatedAt
)
implements UseCases.UseCaseResponse {
}
