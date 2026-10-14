package com.puff.tech.loanmanagement.usecase.update;

import com.puff.tech.core.usecases.UCResponse;
import com.puff.tech.loanmanagement.converter.LoanResponseDto;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record UpdateLoanUseCaseResponse(
        String message,
        LoanResponseDto loan
) implements UCResponse {}
