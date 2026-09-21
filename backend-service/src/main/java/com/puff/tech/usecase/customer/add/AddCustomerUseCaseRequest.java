package com.puff.tech.usecase.customer.add;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

import java.math.BigDecimal;

@Serdeable
public record AddCustomerUseCaseRequest(
        Integer khataBookId,
        String name,
        String phone,
        String email,
        String address,
        String company,
        String pan,
        String contactPerson,
        boolean isSupplier,
        String bankAccount,
        BigDecimal cashBalance,
        String profileImage,
        boolean customerSmsSetting,
        boolean smsLanguage,
        boolean transactionHistoryCheck

)
implements UseCases.UseCaseRequest {
}
