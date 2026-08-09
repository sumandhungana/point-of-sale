package com.puff.tech.usecase.khatabook.selected;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record SelectedKhataBookUseCaseResponse(
        Integer id,
        String companyName,
        String name,
        String email

)implements UseCase.UseCaseResponse {
}
