package com.puff.tech.usecase.invoicesettings.delete;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record DeleteInvoiceSettingUseCaseResponse(
        String message
) implements UseCase.UseCaseResponse {
}
