package com.puff.tech.usecase.smsgateway.create;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record CreateSmsGatewayUseCaseRequest(
        String partnerName,
        Boolean active,
        String form,
        String token,
        String apiUrl,
        String testSms
)
implements UseCase.UseCaseRequest {
}
