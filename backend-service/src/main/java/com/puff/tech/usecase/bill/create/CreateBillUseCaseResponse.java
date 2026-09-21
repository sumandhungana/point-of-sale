package com.puff.tech.usecase.bill.create;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record CreateBillUseCaseResponse(
        String message
)
implements UseCases.UseCaseResponse {
}
