package com.puff.tech.staffmanagement.usecase.staffsalary.delete;

import com.puff.tech.core.usecases.UseCases;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class DeleteStaffSalaryUseCase implements UseCases<DeleteStaffSalaryUseCaseRequest,DeleteStaffSalaryUseCaseResponse> {


    @Inject
    public DeleteStaffSalaryUseCase() {

    }

    @Override
    public Mono<DeleteStaffSalaryUseCaseResponse> execute(DeleteStaffSalaryUseCaseRequest request) {
        return null;
    }
}
