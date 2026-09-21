package com.puff.tech.usecase.service.update;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.http.multipart.CompletedFileUpload;
import io.micronaut.serde.annotation.Serdeable;

import java.math.BigDecimal;

@Serdeable
public record UpdateServiceUseCaseRequest(
        Integer id,
        String serviceName,
        BigDecimal price,
        Boolean taxIncluded,
        BigDecimal tax,
        BigDecimal vat,
        CompletedFileUpload image
) implements UseCases.UseCaseRequest {
}
