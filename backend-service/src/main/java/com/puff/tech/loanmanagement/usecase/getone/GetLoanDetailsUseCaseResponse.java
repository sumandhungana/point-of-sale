package com.puff.tech.loanmanagement.usecase.getone;

import com.puff.tech.core.usecases.UCResponse;
import com.puff.tech.loanmanagement.converter.LoanResponseDto;
import com.puff.tech.loanmanagement.converter.LoanTransactionDto;
import io.micronaut.serde.annotation.Serdeable;

import java.util.List;

@Serdeable
public record GetLoanDetailsUseCaseResponse(
        LoanResponseDto loan,
        List<LoanTransactionDto> transactions
) implements UCResponse {}
