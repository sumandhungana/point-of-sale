package com.puff.tech.usecase.purchase.create;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record CreatePurchaseUseCaseResponse(
        String message
) implements UseCase.UseCaseResponse {
}
