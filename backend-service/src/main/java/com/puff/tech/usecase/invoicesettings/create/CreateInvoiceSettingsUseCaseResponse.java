package com.puff.tech.usecase.invoicesettings.create;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record CreateInvoiceSettingsUseCaseResponse(
        String message
)
implements UseCases.UseCaseResponse {
}
