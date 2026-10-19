package com.puff.tech.staffmanagement.usecase.staffsalary.update;

import com.puff.tech.core.usecases.UseCases;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class UpdateStaffSalaryUseCase implements UseCases<UpdateStaffSalaryUseCaseRequest,UpdateStaffSalaryUseCaseResponse> {


    @Inject
    public UpdateStaffSalaryUseCase() {

    }

    @Override
    public Mono<UpdateStaffSalaryUseCaseResponse> execute(UpdateStaffSalaryUseCaseRequest request) {
        return null;
    }
}
