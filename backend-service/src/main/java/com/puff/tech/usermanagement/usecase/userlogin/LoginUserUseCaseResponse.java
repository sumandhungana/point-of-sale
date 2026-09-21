package com.puff.tech.usermanagement.usecase.userlogin;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record LoginUserUseCaseResponse(
        String token,
        String message,
        UserInfo userInfo

)
implements UseCases.UseCaseResponse {
    @Serdeable
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
            String[] permission,
            String role
                   ) {}

}
