package com.puff.tech.loanmanagement.usecase.getone;

import com.puff.tech.core.usecases.UCRequest;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record GetLoanDetailsUseCaseRequest(
        Long loanId
) implements UCRequest {}
