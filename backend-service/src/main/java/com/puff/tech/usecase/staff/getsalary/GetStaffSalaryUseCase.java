package com.puff.tech.usecase.staff.getsalary;

import com.puff.tech.covertor.StaffSalaryConvertor;
import com.puff.tech.entity.StaffSalaryEntity;
import com.puff.tech.repository.StaffSalaryRepository;
import com.puff.tech.usecase.staffsalary.get.GetStaffSalaryUseCaseResponse;
import io.micronaut.core.annotation.NonNull;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Flux;
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
