package com.puff.tech.usecase.purchase.update;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record UpdatePurchaseUseCaseResponse(
        String message
)
implements UseCase.UseCaseResponse {
}
