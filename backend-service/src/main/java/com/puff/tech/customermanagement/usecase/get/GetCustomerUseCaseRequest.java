package com.puff.tech.customermanagement.usecase.get;

import com.puff.tech.core.usecases.UCRequest;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record GetCustomerUseCaseRequest()
implements UCRequest {
}
