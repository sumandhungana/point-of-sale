package com.puff.tech.usecase.bill.update;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record UpdateBillUseCaseResponse(String message)
implements UseCase.UseCaseResponse {
}
