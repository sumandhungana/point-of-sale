package com.puff.tech.usecase.service.getone;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record GetOneServiceUseCaseRequest(
        Integer id
)
implements UseCases.UseCaseRequest {
}
