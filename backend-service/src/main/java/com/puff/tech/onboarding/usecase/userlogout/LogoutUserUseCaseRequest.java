package com.puff.tech.onboarding.usecase.userlogout;

import com.puff.tech.core.usecases.UCRequest;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record LogoutUserUseCaseRequest(

)implements UCRequest {
}
