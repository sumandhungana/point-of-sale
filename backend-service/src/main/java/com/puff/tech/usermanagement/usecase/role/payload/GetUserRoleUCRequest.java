package com.puff.tech.usermanagement.usecase.role.payload;

import com.puff.tech.core.usecases.UCRequest;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record GetUserRoleUCRequest() implements UCRequest {
}
