package com.puff.tech.usecase.transaction.getone;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record GetOneTransactionUseCaseRequest(
        Integer id
)
implements UseCase.UseCaseRequest {
}
