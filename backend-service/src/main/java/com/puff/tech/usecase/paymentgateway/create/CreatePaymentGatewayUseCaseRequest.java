package com.puff.tech.usecase.paymentgateway.create;

import com.puff.tech.core.usecases.UseCase;
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
implements UseCase.UseCaseRequest {
}
