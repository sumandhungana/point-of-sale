package com.puff.tech.usecase.paymentgateway.update;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record UpdatePaymentGatewayUseCaseRequest(
        Integer id,
        String name,
        String paymentMode,
        String description,
        Boolean isActive,
        String imagePath,
        String verificationUrl,
        String publicKey,
        String secretKey
) implements UseCases.UseCaseRequest {
}
