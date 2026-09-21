package com.puff.tech.usermanagement.usecase.user.update;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

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
implements UseCases.UseCaseRequest {
}
