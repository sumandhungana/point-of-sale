package com.puff.tech.usermanagement.usecase.user.add;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;
import jakarta.validation.constraints.NotNull;

@Serdeable
@Introspected
public record AddUserUseCaseRequest(
        @NotNull(message = "Username is required")
         String userName,
        @NotNull(message = "Password is required")
         String password,
        @NotNull(message = "Branch is required")
         String branch,
        @NotNull(message = "Parent is required")
         String parent,
        @NotNull(message = "Name is required")
         String name,
        @NotNull(message = "Address is required")
         String address,
        @NotNull(message = "Company is required")
         String company,
        @NotNull(message = "Email is required")
         String email,
        @NotNull(message = "Phone is required")
         String phone,
        @NotNull(message = "Pan is required")
         String pan


) implements UseCases.UseCaseRequest {
}
