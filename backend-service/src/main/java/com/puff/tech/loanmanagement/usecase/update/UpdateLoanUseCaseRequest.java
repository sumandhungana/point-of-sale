package com.puff.tech.loanmanagement.usecase.update;

import com.puff.tech.core.usecases.UCRequest;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record UpdateLoanUseCaseRequest(
        Long loanId,
        String lenderName,
        String lenderType,
        String phoneNumber,
        String accountNumber,
        String purpose,
        String remarks,
        String status
) implements UCRequest {}
