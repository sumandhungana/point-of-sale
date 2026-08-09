package com.puff.tech.usecase.item.getone;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record GetOneItemUseCaseRequest(
        Integer id
)
implements UseCase.UseCaseRequest {
}
