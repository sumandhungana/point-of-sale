package com.puff.tech.customermanagement.usecase.update;

import com.puff.tech.core.usecases.UCResponse;
import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;
import lombok.Builder;

@Builder
@Serdeable
public record UpdateCustomerUseCaseResponse(
        String message,
        Integer id
)
implements UCResponse {
}
