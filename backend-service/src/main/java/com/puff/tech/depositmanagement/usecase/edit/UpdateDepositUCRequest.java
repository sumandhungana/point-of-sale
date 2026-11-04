package com.puff.tech.depositmanagement.usecase.edit;

import com.puff.tech.core.usecases.UCRequest;
import io.micronaut.serde.annotation.Serdeable;

import java.math.BigDecimal;

@Serdeable
public record UpdateDepositUCRequest(
        long id,
        BigDecimal amount,
        String remarks
)
implements UCRequest {
}
