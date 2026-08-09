package com.puff.tech.usecase.invoicesettings.create;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record CreateInvoiceSettingsUseCaseResponse(
        String message
)
implements UseCase.UseCaseResponse {
}
