package com.puff.tech.depositmanagement.usecase.delete;

import com.puff.tech.core.usecases.UCRequest;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record DeleteDepositUCRequest(
        long id
) implements UCRequest {
}
