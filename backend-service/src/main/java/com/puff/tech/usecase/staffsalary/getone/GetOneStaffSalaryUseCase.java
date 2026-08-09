package com.puff.tech.usecase.staffsalary.getone;

import com.puff.tech.core.usecases.UseCase;
import com.puff.tech.covertor.StaffSalaryConvertor;
import com.puff.tech.repository.StaffSalaryRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import com.puff.tech.usecase.staffsalary.get.GetStaffSalaryUseCaseResponse;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class GetOneStaffSalaryUseCase implements UseCase<GetOneStaffSalaryUseCaseRequest, GetStaffSalaryUseCaseResponse> {

    private final StaffSalaryRepository staffSalaryRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public GetOneStaffSalaryUseCase(StaffSalaryRepository staffSalaryRepository,
                                    KhataBookImplementation khataBookImplementation) {
        this.staffSalaryRepository = staffSalaryRepository;
        this.khataBookImplementation = khataBookImplementation;
    }


    @Override
    public Mono<GetStaffSalaryUseCaseResponse> execute(GetOneStaffSalaryUseCaseRequest request) {
        return khataBookImplementation.getCurrentKhataBookId()
                .flatMap(khataBookId->
                        staffSalaryRepository.findByIdAndKhataBookId(request.id(), khataBookId)
                                .map(StaffSalaryConvertor::toResponse)
                                .onErrorResume(err->Mono.error(new RuntimeException("Unexpected happened" +err.getLocalizedMessage()))));
    }
}
