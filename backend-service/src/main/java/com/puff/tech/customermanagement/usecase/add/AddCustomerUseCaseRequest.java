package com.puff.tech.customermanagement.usecase.add;

import com.puff.tech.core.usecases.UCRequest;
import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

import java.math.BigDecimal;

@Serdeable
public record AddCustomerUseCaseRequest(

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
implements UCRequest {
}
