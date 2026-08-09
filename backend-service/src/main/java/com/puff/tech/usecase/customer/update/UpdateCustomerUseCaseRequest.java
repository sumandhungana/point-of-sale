package com.puff.tech.usecase.customer.update;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

import java.math.BigDecimal;

@Serdeable
public record UpdateCustomerUseCaseRequest(

        Integer khataBookId,
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
implements UseCase.UseCaseRequest {
}
