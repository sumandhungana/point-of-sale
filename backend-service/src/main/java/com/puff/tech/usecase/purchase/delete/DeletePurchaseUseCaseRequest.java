package com.puff.tech.usecase.purchase.delete;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record DeletePurchaseUseCaseRequest(
        Integer id
) implements UseCase.UseCaseRequest {
}
