package com.puff.tech.staffmanagement.usecase.staffsalary.getbystaffid;

import com.puff.tech.staffmanagement.converter.StaffSalaryConvertor;
import com.puff.tech.staffmanagement.repository.StaffSalaryRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import com.puff.tech.staffmanagement.usecase.staffsalary.get.GetStaffSalaryUseCaseResponse;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Flux;

@Singleton
public class GetStaffSalaryByStaffIdUseCase {

    private final StaffSalaryRepository staffSalaryRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public GetStaffSalaryByStaffIdUseCase(StaffSalaryRepository staffSalaryRepository,
                                          KhataBookImplementation khataBookImplementation) {
        this.staffSalaryRepository = staffSalaryRepository;
        this.khataBookImplementation = khataBookImplementation;
    }

    public Flux<GetStaffSalaryUseCaseResponse> execute(GetStaffSalaryByStaffIdUseCaseRequest request){
        return khataBookImplementation.getCurrentKhataBookId()
                .flatMapMany(khataBookId->
                        staffSalaryRepository.findByStaffIdAndMemberId(request.staffId(), khataBookId.longValue())
                                .map(StaffSalaryConvertor::toResponse)
                                .onErrorResume(err->Flux.error(new RuntimeException("Unexpected happened" +err.getLocalizedMessage()))));
    }
}
