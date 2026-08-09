package com.puff.tech.usecase.file.fileupload;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record FileUploadUseCaseResponse(
        String message
) implements UseCase.UseCaseResponse {
}
