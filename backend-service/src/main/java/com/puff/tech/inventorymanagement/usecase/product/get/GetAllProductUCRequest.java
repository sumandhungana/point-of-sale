package com.puff.tech.inventorymanagement.usecase.product.get;

import com.puff.tech.core.usecases.UCRequest;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record GetAllProductUCRequest(

) implements UCRequest {
}
