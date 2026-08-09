package com.puff.tech.usecase.invoicesettings.delete;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record DeleteInvoiceSettingUseCaseRequest (
        Integer id
)implements UseCase.UseCaseRequest {
}
