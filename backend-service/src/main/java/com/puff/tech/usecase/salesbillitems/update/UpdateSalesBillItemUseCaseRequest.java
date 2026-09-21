package com.puff.tech.usecase.salesbillitems.update;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

import java.math.BigDecimal;

@Serdeable
public record UpdateSalesBillItemUseCaseRequest(
        Integer id,
        Integer salesBillId,
        Integer itemId,
        BigDecimal quantity,
        BigDecimal unitPrice,
        BigDecimal discount,
        BigDecimal tax
)
implements UseCases.UseCaseRequest {
}
