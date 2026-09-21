package com.puff.tech.usermanagement.usecase.userlogout;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record LogoutUserUseCaseRequest(

)implements UseCases.UseCaseRequest {
}
