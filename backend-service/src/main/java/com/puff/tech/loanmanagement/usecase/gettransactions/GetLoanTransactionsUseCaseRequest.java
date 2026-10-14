package com.puff.tech.loanmanagement.usecase.gettransactions;

import com.puff.tech.core.usecases.UCRequest;
import io.micronaut.core.annotation.Nullable;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record GetLoanTransactionsUseCaseRequest(
        @Nullable Long loanId
) implements UCRequest {}
