package com.puff.tech.inventorymanagement.usecase.salesbill.getsingle;

import com.puff.tech.core.usecases.UCRequest;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record GetSingleSalesBillUCRequest(
        Long id
) implements UCRequest {
}
