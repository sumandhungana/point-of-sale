package com.puff.tech.payment.usecase.add;

import com.puff.tech.core.usecases.UCRequest;
import com.puff.tech.payment.enums.PaymentCategory;
import com.puff.tech.payment.enums.PaymentParty;
import com.puff.tech.payment.enums.PaymentType;
import io.micronaut.core.annotation.Nullable;
import io.micronaut.serde.annotation.Serdeable;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

@Serdeable
public record AddPaymentUCRequest(
        @NotNull(message = "Payment party is required")
        PaymentParty paymentParty,

        @Nullable
        Long customerId,

        @Nullable
        Long supplierId,

        @Nullable
        Long staffId,

        @NotNull(message = "Amount is required")
        @Positive(message = "Amount must be greater than zero")
        BigDecimal amount,

        @NotNull(message = "Payment type is required")
        PaymentType paymentType,

        @NotNull(message = "Payment category is required")
        PaymentCategory paymentCategory,

        @Nullable
        @Size(max = 512, message = "Bill path must not exceed 512 characters")
        String billPath,

        @Nullable
        @Size(max = 1000, message = "Remarks must not exceed 1000 characters")
        String remarks
) implements UCRequest {
}
