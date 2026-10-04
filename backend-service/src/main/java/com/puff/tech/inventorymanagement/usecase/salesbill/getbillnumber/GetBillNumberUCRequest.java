package com.puff.tech.inventorymanagement.usecase.salesbill.getbillnumber;

import com.puff.tech.core.usecases.UCRequest;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record GetBillNumberUCRequest(

) implements UCRequest {
}
