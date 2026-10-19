package com.puff.tech.staffmanagement.usecase.staffsalary.get;

import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Flux;

@Singleton
public class GetStaffSalaryUseCase {



    @Inject
    public GetStaffSalaryUseCase() {

    }

    public Flux<GetStaffSalaryUseCaseResponse> execute(){
        return null;
    }
}
