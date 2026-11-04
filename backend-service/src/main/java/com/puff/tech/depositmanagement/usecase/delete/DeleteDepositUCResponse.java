package com.puff.tech.depositmanagement.usecase.delete;

import com.puff.tech.core.usecases.UCResponse;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record DeleteDepositUCResponse(
        String message
) implements UCResponse {
}
