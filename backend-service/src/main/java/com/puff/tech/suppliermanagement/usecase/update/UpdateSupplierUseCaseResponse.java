package com.puff.tech.suppliermanagement.usecase.update;

import com.puff.tech.core.usecases.UCResponse;
import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;
import lombok.Builder;


@Serdeable
@Builder
public record UpdateSupplierUseCaseResponse(
        String message
) implements UCResponse {
}
