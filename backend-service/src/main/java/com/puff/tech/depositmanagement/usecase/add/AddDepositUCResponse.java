package com.puff.tech.depositmanagement.usecase.add;

import com.puff.tech.core.usecases.UCResponse;
import io.micronaut.serde.annotation.Serdeable;
import lombok.Builder;

@Serdeable
@Builder
public record AddDepositUCResponse(
        long id,
        String message
) implements UCResponse {
}
