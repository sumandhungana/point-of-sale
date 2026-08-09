package com.puff.tech.usecase.smsgateway.update;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record UpdateSmsGatewayUseCaseRequest(
        Integer id,
        String partnerName,
        Boolean active,
        String form,
        String token,
        String apiUrl,
        String testSms
)implements UseCase.UseCaseRequest {
}
