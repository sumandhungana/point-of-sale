package com.puff.tech.depositmanagement.usecase.edit;

import com.puff.tech.core.usecases.UCResponse;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record UpdateDepositUCResponse(
        String message
)
implements UCResponse {
}
