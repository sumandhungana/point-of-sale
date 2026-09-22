package com.puff.tech.onboarding.usecase.userlogin;

import com.puff.tech.core.usecases.UCResponse;
import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;
import lombok.Builder;

@Serdeable
public record LoginUserUseCaseResponse(
        String token,
        String message,
        UserInfo userInfo

)
implements UCResponse {
    @Serdeable
    @Builder
    record UserInfo(
            Long id,
            String userId,
            String userName,
            String email,
            String imagePath,
            String subscriptionType,
            String subscriptionStartDate,
            String subscriptionEndDate,
            boolean isSubscriptionActive,
            boolean hasUsedTrial,
            String subscriptionStatus,
            String permission,
            String role,
            Long memberId,
            String organizationName,
            boolean enabled
                   ) {}

}
