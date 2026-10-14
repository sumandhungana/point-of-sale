package com.puff.tech.loanmanagement.usecase.create;

import com.puff.tech.core.usecases.UCResponse;
import com.puff.tech.loanmanagement.converter.LoanResponseDto;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record CreateLoanUseCaseResponse(
        String message,
        Long loanId,
        LoanResponseDto loan
) implements UCResponse {}
