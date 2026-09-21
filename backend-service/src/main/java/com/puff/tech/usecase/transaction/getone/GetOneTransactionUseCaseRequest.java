package com.puff.tech.usecase.transaction.getone;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record GetOneTransactionUseCaseRequest(
        Integer id
)
implements UseCases.UseCaseRequest {
}
