package com.puff.tech.usecase.khatabook.update;

import com.puff.tech.core.usecases.UseCase;
import com.puff.tech.domain.BusinessCategory;
import com.puff.tech.domain.BusinessType;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record UpdateKhataBookUseCaseRequest(
        String name,
        String number,
        String address,
        String email,
        String companyName,
        String companyNumber,
        String companyAddress,
        String companyEmail,
        BusinessCategory businessCategory,
        BusinessType businessType,
        boolean taxVat,
        String bookAccount,
        boolean kyc,
        String imagePath
) implements UseCase.UseCaseRequest {
}
