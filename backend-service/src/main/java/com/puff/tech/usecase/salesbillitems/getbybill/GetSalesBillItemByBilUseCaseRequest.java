package com.puff.tech.usecase.salesbillitems.getbybill;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record GetSalesBillItemByBilUseCaseRequest(
        Integer salesBillId
) implements UseCases.UseCaseRequest {
}
