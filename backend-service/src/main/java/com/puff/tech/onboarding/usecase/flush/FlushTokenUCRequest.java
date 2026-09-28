package com.puff.tech.onboarding.usecase.flush;

import com.puff.tech.core.usecases.UCRequest;
import io.micronaut.core.annotation.Nullable;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record FlushTokenUCRequest(
        Long memberId,
        @Nullable
        Long refMemberId
) implements UCRequest {
}
