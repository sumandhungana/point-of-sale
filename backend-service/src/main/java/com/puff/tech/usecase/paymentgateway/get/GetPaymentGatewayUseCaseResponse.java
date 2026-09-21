package com.puff.tech.usecase.paymentgateway.get;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

import java.time.Instant;

@Serdeable
public record GetPaymentGatewayUseCaseResponse(
        Integer id,
        String name,
        String paymentMode,
        String description,
        Boolean isActive,
        String imagePath,
        String verificationUrl,
        String publicKey,
        String secretKey,
        Instant createdAt,
        Instant updatedAt
)
implements UseCases.UseCaseResponse {
}
