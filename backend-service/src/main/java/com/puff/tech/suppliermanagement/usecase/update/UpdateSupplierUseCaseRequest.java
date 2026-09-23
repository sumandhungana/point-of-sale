package com.puff.tech.suppliermanagement.usecase.update;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record UpdateSupplierUseCaseRequest(
        Integer id,
        String name,
        String phone,
        String email,
        String address,
        String company,
        String pan,
        String contactPerson,
        String profileImage
)
implements UseCases.UseCaseRequest {
}
