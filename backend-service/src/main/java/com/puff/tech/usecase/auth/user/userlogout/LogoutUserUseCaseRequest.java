package com.puff.tech.usecase.auth.user.userlogout;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record LogoutUserUseCaseRequest(

)implements UseCase.UseCaseRequest {
}
