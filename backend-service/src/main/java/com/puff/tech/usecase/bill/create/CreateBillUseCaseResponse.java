package com.puff.tech.usecase.bill.create;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record CreateBillUseCaseResponse(
        String message
)
implements UseCase.UseCaseResponse {
}
