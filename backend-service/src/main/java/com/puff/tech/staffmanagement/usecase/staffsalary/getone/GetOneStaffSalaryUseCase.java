package com.puff.tech.staffmanagement.usecase.staffsalary.getone;

import com.puff.tech.core.usecases.UseCases;
import com.puff.tech.staffmanagement.usecase.staffsalary.get.GetStaffSalaryUseCaseResponse;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class GetOneStaffSalaryUseCase implements UseCases<GetOneStaffSalaryUseCaseRequest, GetStaffSalaryUseCaseResponse> {


    @Inject
    public GetOneStaffSalaryUseCase() {

    }


    @Override
    public Mono<GetStaffSalaryUseCaseResponse> execute(GetOneStaffSalaryUseCaseRequest request) {
        return null;
    }
}
