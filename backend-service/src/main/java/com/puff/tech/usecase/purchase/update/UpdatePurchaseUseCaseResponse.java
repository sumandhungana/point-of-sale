package com.puff.tech.usecase.purchase.update;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record UpdatePurchaseUseCaseResponse(
        String message
)
implements UseCases.UseCaseResponse {
}
