package com.puff.tech.loanmanagement.usecase.recordpayment;

import com.puff.tech.core.usecases.UCResponse;
import com.puff.tech.loanmanagement.converter.LoanResponseDto;
import com.puff.tech.loanmanagement.converter.LoanTransactionDto;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record RecordLoanPaymentUseCaseResponse(
        String message,
        LoanResponseDto loan,
        LoanTransactionDto transaction
) implements UCResponse {}
