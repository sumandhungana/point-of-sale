package com.puff.tech.usecase.purchase.delete;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record DeletePurchaseUseCaseResponse(
        String message
)implements UseCases.UseCaseResponse {
}
