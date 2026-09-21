package com.puff.tech.usecase.smsgateway.update;

import com.puff.tech.core.usecases.UseCases;
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
)implements UseCases.UseCaseRequest {
}
