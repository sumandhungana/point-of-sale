package com.puff.tech.staffmanagement.usecase.staffsalary.get;

import com.puff.tech.staffmanagement.converter.StaffSalaryConvertor;
import com.puff.tech.staffmanagement.repository.StaffSalaryRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Flux;

@Singleton
public class GetStaffSalaryUseCase {

    private final StaffSalaryRepository staffSalaryRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public GetStaffSalaryUseCase(StaffSalaryRepository staffSalaryRepository,
                                 KhataBookImplementation khataBookImplementation) {
        this.staffSalaryRepository = staffSalaryRepository;
        this.khataBookImplementation = khataBookImplementation;
    }

    public Flux<GetStaffSalaryUseCaseResponse> execute(){
        return khataBookImplementation.getCurrentKhataBookId()
                .flatMapMany(khataBookId->
                        staffSalaryRepository.findAllByKhataBookId(khataBookId)
                                .map(StaffSalaryConvertor::toResponse)
                                .onErrorResume(err->Flux.error(new RuntimeException("Unexpected happened" +err.getLocalizedMessage()))));
    }
}
