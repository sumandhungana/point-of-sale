package com.puff.tech.usecase.auth.user.userlogin;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record LoginUserUseCaseResponse(
        String token,
        String message,
        String[] permission,
        String userName

)
implements UseCase.UseCaseResponse {
}
