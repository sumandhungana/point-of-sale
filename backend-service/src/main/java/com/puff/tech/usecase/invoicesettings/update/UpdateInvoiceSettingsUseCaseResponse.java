package com.puff.tech.usecase.invoicesettings.update;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record UpdateInvoiceSettingsUseCaseResponse(
        String message
)
implements UseCase.UseCaseResponse {
}
