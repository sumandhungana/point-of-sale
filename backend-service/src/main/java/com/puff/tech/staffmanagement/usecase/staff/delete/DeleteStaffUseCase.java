package com.puff.tech.staffmanagement.usecase.staff.delete;

import com.puff.tech.core.usecases.UseCases;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class DeleteStaffUseCase implements UseCases<DeleteStaffUseCaseRequest,DeleteStaffUseCaseResponse> {


    @Inject
    public DeleteStaffUseCase() {

    }

    @Override
    public Mono<DeleteStaffUseCaseResponse> execute(DeleteStaffUseCaseRequest request) {
       return null;
    }
}
