package com.puff.tech.usecase.purchase.create;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record CreatePurchaseUseCaseResponse(
        String message
) implements UseCases.UseCaseResponse {
}
