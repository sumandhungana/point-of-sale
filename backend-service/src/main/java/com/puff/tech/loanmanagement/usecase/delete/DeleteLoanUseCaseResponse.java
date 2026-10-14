package com.puff.tech.loanmanagement.usecase.delete;

import com.puff.tech.core.usecases.UCResponse;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record DeleteLoanUseCaseResponse(
        String message,
        Long loanId
) implements UCResponse {}
