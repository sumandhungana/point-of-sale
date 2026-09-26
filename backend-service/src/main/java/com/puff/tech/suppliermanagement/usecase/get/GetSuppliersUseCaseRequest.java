package com.puff.tech.suppliermanagement.usecase.get;

import com.puff.tech.core.usecases.UCRequest;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record GetSuppliersUseCaseRequest()
implements UCRequest {
}
