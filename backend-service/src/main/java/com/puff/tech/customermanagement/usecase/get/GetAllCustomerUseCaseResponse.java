package com.puff.tech.customermanagement.usecase.get;

import com.puff.tech.core.usecases.UCResponse;
import io.micronaut.serde.annotation.Serdeable;

import java.math.BigDecimal;

@Serdeable
public record GetAllCustomerUseCaseResponse(
        Integer customerId,
        String name,
        String phone,
        String email,
        String address,
        String company,
        String pan,
        String contactPerson,
        String bankAccount,
        BigDecimal cashBalance,
        String profileImage
)
implements UCResponse {
}
