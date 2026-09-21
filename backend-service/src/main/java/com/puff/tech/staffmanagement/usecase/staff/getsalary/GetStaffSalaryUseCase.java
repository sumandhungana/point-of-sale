package com.puff.tech.staffmanagement.usecase.staff.getsalary;

import com.puff.tech.entity.StaffSalaryEntity;
import com.puff.tech.staffmanagement.repository.StaffSalaryRepository;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class GetStaffSalaryUseCase {

    private final StaffSalaryRepository staffSalaryRepository;

    @Inject
    public GetStaffSalaryUseCase(StaffSalaryRepository staffSalaryRepository) {
        this.staffSalaryRepository = staffSalaryRepository;
    }

    public  Mono<StaffSalaryEntity> execute(Integer id){
        return staffSalaryRepository.findById(id);

    }
}
