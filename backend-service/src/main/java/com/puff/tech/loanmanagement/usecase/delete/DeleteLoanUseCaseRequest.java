package com.puff.tech.loanmanagement.usecase.delete;

import com.puff.tech.core.usecases.UCRequest;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record DeleteLoanUseCaseRequest(
        Long loanId
) implements UCRequest {}
