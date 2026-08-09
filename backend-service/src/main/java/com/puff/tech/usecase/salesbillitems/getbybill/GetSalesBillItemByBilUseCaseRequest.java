package com.puff.tech.usecase.salesbillitems.getbybill;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record GetSalesBillItemByBilUseCaseRequest(
        Integer salesBillId
) implements UseCase.UseCaseRequest {
}
