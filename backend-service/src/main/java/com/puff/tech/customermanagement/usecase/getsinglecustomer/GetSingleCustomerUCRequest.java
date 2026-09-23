package com.puff.tech.customermanagement.usecase.getsinglecustomer;

import com.puff.tech.core.usecases.UCRequest;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record GetSingleCustomerUCRequest(
        Integer customerId
)implements UCRequest {
}
