package com.puff.tech.usecase.user.update;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;
import jakarta.validation.constraints.NotNull;

@Serdeable
public record UpdateUserUseCaseRequest(

        String branch,
        String parent,
        String name,
        String address,
        String company,
        String email,
        String phone,
        String pan
)
implements UseCase.UseCaseRequest {
}
