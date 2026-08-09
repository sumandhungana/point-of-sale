package com.puff.tech.usecase.service.get;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

import java.math.BigDecimal;
import java.time.Instant;

@Serdeable
public record GetServiceUseCaseResponse(
        Integer id,
        String serviceName,
        BigDecimal price,
        Boolean taxIncluded,
        BigDecimal tax,
        BigDecimal vat,
        String image,
        Instant createdAt,
        Instant updatedAt
)
implements UseCase.UseCaseResponse {
}
