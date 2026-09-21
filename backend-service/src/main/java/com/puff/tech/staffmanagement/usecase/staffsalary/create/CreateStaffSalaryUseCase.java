package com.puff.tech.staffmanagement.usecase.staffsalary.create;

import com.puff.tech.core.usecases.UseCases;
import com.puff.tech.staffmanagement.converter.StaffSalaryConvertor;
import com.puff.tech.staffmanagement.repository.StaffSalaryRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class CreateStaffSalaryUseCase implements UseCases<CreateStaffSalaryUseCaseRequest,CreateStaffSalaryUseCaseResponse> {

    private final StaffSalaryRepository staffSalaryRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public CreateStaffSalaryUseCase(StaffSalaryRepository staffSalaryRepository,
                                    KhataBookImplementation khataBookImplementation) {
        this.staffSalaryRepository = staffSalaryRepository;
        this.khataBookImplementation = khataBookImplementation;
    }

    @Override
    public Mono<CreateStaffSalaryUseCaseResponse> execute(CreateStaffSalaryUseCaseRequest request) {
        return khataBookImplementation.getCurrentKhataBookId()
                .flatMap(khataBookId->{
                    var staffSalary= StaffSalaryConvertor.toEntity(request,khataBookId);
                    return staffSalaryRepository.save(staffSalary)
                            .map(saved->new CreateStaffSalaryUseCaseResponse("Staff salary created"))
                            .onErrorResume(err->Mono.error(new RuntimeException("Unexpected happened" +err.getLocalizedMessage())));
                });
    }
}
