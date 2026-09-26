package com.puff.tech.onboarding.usecase.member.getall;

import com.puff.tech.core.usecases.UCRequest;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record GetAllMemberUseCaseRequest()
implements UCRequest {
}
