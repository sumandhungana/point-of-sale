package com.puff.tech.usecase.invoicesettings.delete;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record DeleteInvoiceSettingUseCaseResponse(
        String message
) implements UseCases.UseCaseResponse {
}
