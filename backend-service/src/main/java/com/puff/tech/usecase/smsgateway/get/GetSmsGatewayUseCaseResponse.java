package com.puff.tech.usecase.smsgateway.get;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

import java.time.Instant;

@Serdeable
public record GetSmsGatewayUseCaseResponse(
        Integer id,
        String partnerName,
        Boolean active,
        String form,
        String token,
        String apiUrl,
        String testSms,
        Instant createdAt,
        Instant updatedAt
)
implements UseCase.UseCaseResponse {
}
