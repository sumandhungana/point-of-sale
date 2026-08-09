package com.puff.tech.usecase.staffsalary.create;

import com.puff.tech.core.usecases.UseCase;
import com.puff.tech.covertor.StaffSalaryConvertor;
import com.puff.tech.repository.StaffSalaryRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class CreateStaffSalaryUseCase implements UseCase<CreateStaffSalaryUseCaseRequest,CreateStaffSalaryUseCaseResponse> {

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
