package com.puff.tech.usecase.salesbillitems.create;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

import java.math.BigDecimal;

@Serdeable
public record CreateSalesBillItemUseCaseRequest(
        Integer salesBillId,
        Integer itemId,
        BigDecimal quantity,
        BigDecimal unitPrice,
        BigDecimal totalPrice,
        BigDecimal discount,
       BigDecimal tax
)
implements UseCase.UseCaseRequest {
}
