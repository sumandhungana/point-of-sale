package com.puff.tech.usecase.purchase.getone;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record GetOnePurchaseUseCaseRequest(
        Integer id
) implements UseCases.UseCaseRequest {
}
