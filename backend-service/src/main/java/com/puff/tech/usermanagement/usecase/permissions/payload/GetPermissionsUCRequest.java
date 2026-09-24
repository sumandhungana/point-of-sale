package com.puff.tech.usermanagement.usecase.permissions.payload;

import com.puff.tech.core.usecases.UCRequest;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record GetPermissionsUCRequest(

) implements UCRequest {
}
