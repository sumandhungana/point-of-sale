package com.puff.tech.onboarding.usecase.user.get;

import com.puff.tech.core.usecases.UCRequest;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record GetUserUCRequest() implements UCRequest {
}
