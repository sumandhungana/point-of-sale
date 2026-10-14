package com.puff.tech.loanmanagement.usecase.recordpayment;

import com.puff.tech.core.usecases.UCRequest;
import io.micronaut.serde.annotation.Serdeable;

import java.math.BigDecimal;
import java.time.LocalDate;

@Serdeable
public record RecordLoanPaymentUseCaseRequest(
        Long loanId,
        String type, // PAYMENT_GIVEN, PAYMENT_RECEIVED
        BigDecimal amount,
        LocalDate paymentDate,
        String paymentMode,
        BigDecimal principalComponent,
        BigDecimal interestComponent,
        String referenceNo,
        String remarks
) implements UCRequest {}
