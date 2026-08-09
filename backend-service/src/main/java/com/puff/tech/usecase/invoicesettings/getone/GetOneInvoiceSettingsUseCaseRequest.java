package com.puff.tech.usecase.invoicesettings.getone;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record GetOneInvoiceSettingsUseCaseRequest(
        Integer id
) implements UseCase.UseCaseRequest {
}
