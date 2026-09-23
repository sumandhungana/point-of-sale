package com.puff.tech.customermanagement.usecase.update;

import com.puff.tech.core.usecases.UCRequest;
import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

import java.math.BigDecimal;

@Serdeable
public record UpdateCustomerUseCaseRequest(
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
implements UCRequest {
}
