package com.puff.tech.usecase.service.create;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.http.multipart.CompletedFileUpload;
import io.micronaut.serde.annotation.Serdeable;

import java.math.BigDecimal;

@Serdeable
public record CreateServiceUseCaseRequest(
        String serviceName,
        BigDecimal price,
        Boolean taxIncluded,
        BigDecimal tax,
        BigDecimal vat,
        CompletedFileUpload image
)implements UseCase.UseCaseRequest {
}
