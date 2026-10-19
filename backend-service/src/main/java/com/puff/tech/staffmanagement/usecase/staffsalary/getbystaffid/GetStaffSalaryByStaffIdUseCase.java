package com.puff.tech.staffmanagement.usecase.staffsalary.getbystaffid;

import com.puff.tech.staffmanagement.usecase.staffsalary.get.GetStaffSalaryUseCaseResponse;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Flux;

@Singleton
public class GetStaffSalaryByStaffIdUseCase {



    @Inject
    public GetStaffSalaryByStaffIdUseCase() {

    }

    public Flux<GetStaffSalaryUseCaseResponse> execute(GetStaffSalaryByStaffIdUseCaseRequest request){
        return null;
    }
}
