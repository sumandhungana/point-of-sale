package com.puff.tech.usecase.salesbills.create;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

import java.math.BigDecimal;
import java.time.LocalDate;

@Serdeable
public record CreateSalesBillUseCaseRequest(
        String billNumber,
        LocalDate billDate,
        Integer customerId,
        String paymentMode,
        BigDecimal amount,
        String remarks,
        String photoPath

)
implements UseCases.UseCaseRequest {
}
