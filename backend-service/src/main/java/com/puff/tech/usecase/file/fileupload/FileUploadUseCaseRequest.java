package com.puff.tech.usecase.file.fileupload;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.http.multipart.CompletedFileUpload;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record FileUploadUseCaseRequest(
        CompletedFileUpload file
) implements UseCase.UseCaseRequest {
}
