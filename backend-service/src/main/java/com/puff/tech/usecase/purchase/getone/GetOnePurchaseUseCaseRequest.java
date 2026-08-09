package com.puff.tech.usecase.purchase.getone;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record GetOnePurchaseUseCaseRequest(
        Integer id
) implements UseCase.UseCaseRequest {
}
