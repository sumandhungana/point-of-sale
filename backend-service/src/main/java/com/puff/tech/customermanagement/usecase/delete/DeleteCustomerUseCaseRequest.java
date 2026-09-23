package com.puff.tech.customermanagement.usecase.delete;

import com.puff.tech.core.usecases.UCRequest;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record DeleteCustomerUseCaseRequest(
        Integer id
)
implements UCRequest {
}
