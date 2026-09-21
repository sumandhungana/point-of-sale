package com.puff.tech.usecase.file.fileupload;

import com.puff.tech.core.usecases.UseCases;
import com.puff.tech.core.utils.HelperUtils;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class FileUploadUseCase implements UseCases<FileUploadUseCaseRequest, FileUploadUseCaseResponse> {

    private final HelperUtils helperUtils;

    @Inject
    public FileUploadUseCase(HelperUtils helperUtils) {
        this.helperUtils = helperUtils;
    }

    @Override
    public Mono<FileUploadUseCaseResponse> execute(FileUploadUseCaseRequest request) {
        if (request.file() == null) {
            return Mono.error(new RuntimeException("No file provided"));
        }

        return Mono.fromCallable(() -> {
                    String path = helperUtils.uploadFile(request.file());
                    return new FileUploadUseCaseResponse(path);
                })
                .onErrorResume(err -> Mono.error(new RuntimeException("Error uploading file: " + err.getMessage())));
    }


}