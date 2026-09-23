package com.puff.tech.customermanagement.usecase.delete;

import com.puff.tech.core.usecases.UCResponse;
import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;
import lombok.Builder;

@Builder
@Serdeable
public record DeleteCustomerUseCaseResponse(
        String message
)implements UCResponse {
}
