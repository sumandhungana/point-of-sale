package com.puff.tech.usecase.purchase.create;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

import java.math.BigDecimal;
import java.time.LocalDate;

@Serdeable
public record CreatePurchaseUseCaseRequest(
         String purchaseNo,
         LocalDate date,
         Integer categoryId,
         Integer itemId,
         String paymentMode,
         BigDecimal amount,
         String remarks,
         String photoPath
)
implements UseCase.UseCaseRequest {
}
