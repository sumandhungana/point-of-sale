package com.puff.tech.controller;

import com.puff.tech.core.responses.RestResponse;

import com.puff.tech.usecase.file.fileupload.FileUploadUseCase;
import com.puff.tech.usecase.file.fileupload.FileUploadUseCaseRequest;
import com.puff.tech.usecase.file.fileupload.FileUploadUseCaseResponse;
import io.micronaut.http.MediaType;
import io.micronaut.http.annotation.*;
import io.micronaut.http.multipart.CompletedFileUpload;
import jakarta.inject.Inject;
import reactor.core.publisher.Mono;

@Controller("/api/file-upload")
public class FileUploadController {

    private final FileUploadUseCase fileUploadUseCase;

    @Inject
    public FileUploadController(FileUploadUseCase fileUploadUseCase) {
        this.fileUploadUseCase = fileUploadUseCase;
    }

    @Post(consumes = MediaType.MULTIPART_FORM_DATA)
    public Mono<RestResponse<FileUploadUseCaseResponse>> upload(@Part CompletedFileUpload file) {
        var request = new FileUploadUseCaseRequest(file);

        return fileUploadUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err -> Mono.just(RestResponse.error(err.getMessage())));
    }

    @Get
    public RestResponse<String> status() {
        return RestResponse.success("File upload service is running");
    }
}