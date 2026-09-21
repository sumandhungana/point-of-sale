package com.puff.tech.usecase.supplier.create;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record CreateSupplierUseCaseRequest(

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
