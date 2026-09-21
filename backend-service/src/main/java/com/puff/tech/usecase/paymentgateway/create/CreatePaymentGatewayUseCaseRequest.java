package com.puff.tech.usecase.paymentgateway.create;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record CreatePaymentGatewayUseCaseRequest(
        String name,
        String paymentMode,
        String description,
        Boolean isActive,
        String imagePath,
        String verificationUrl,
        String publicKey,
        String secretKey

)
implements UseCases.UseCaseRequest {
}
