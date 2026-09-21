package com.puff.tech.usecase.invoicesettings.getone;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record GetOneInvoiceSettingsUseCaseRequest(
        Integer id
) implements UseCases.UseCaseRequest {
}
