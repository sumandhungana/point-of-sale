package com.puff.tech.usecase.user.get;

import io.micronaut.serde.annotation.Serdeable;

import java.time.Instant;

@Serdeable
public record GetUserUseCaseResponse(

        String userName,
        String branch,
        String permission,
        String parent,
        String name,
        String address,
        String company,
        String email,
        String phone,
        String pan,
        Instant createdAt,
        Instant updatedAt

) {
}
