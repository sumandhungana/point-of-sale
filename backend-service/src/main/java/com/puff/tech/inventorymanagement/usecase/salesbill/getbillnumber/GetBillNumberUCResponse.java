package com.puff.tech.inventorymanagement.usecase.salesbill.getbillnumber;

import com.puff.tech.core.usecases.UCResponse;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record GetBillNumberUCResponse(
        String billNumber
) implements UCResponse {
}
