package com.puff.tech.depositmanagement.usecase.get;

import com.puff.tech.core.usecases.UCRequest;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record GetDepositUCRequest(
        long partyId
) implements UCRequest {
}
