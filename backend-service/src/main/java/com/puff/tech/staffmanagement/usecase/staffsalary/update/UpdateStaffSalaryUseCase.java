package com.puff.tech.staffmanagement.usecase.staffsalary.update;

import com.puff.tech.core.usecases.UseCases;
import com.puff.tech.staffmanagement.converter.StaffSalaryConvertor;
import com.puff.tech.staffmanagement.repository.StaffSalaryRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class UpdateStaffSalaryUseCase implements UseCases<UpdateStaffSalaryUseCaseRequest,UpdateStaffSalaryUseCaseResponse> {

    private final StaffSalaryRepository staffSalaryRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public UpdateStaffSalaryUseCase(StaffSalaryRepository staffSalaryRepository,
                                    KhataBookImplementation khataBookImplementation) {
        this.staffSalaryRepository = staffSalaryRepository;
        this.khataBookImplementation = khataBookImplementation;
    }

    @Override
    public Mono<UpdateStaffSalaryUseCaseResponse> execute(UpdateStaffSalaryUseCaseRequest request) {
        return khataBookImplementation.getCurrentKhataBookId()
                .flatMap(khataBookId->
                        staffSalaryRepository.findByIdAndKhataBookId(request.id(), khataBookId)
                                .switchIfEmpty(Mono.error(new RuntimeException("Salary not found")))
                                .flatMap(staffSalaryEntity -> {
                                    var updated= StaffSalaryConvertor.toEntityUpdate(request,staffSalaryEntity);
                                    return staffSalaryRepository.update(updated)
                                            .map(saved->new UpdateStaffSalaryUseCaseResponse("Salary updated successfully"))
                                            .onErrorResume(err-> Mono.error(new RuntimeException("unexpected happened" +err.getLocalizedMessage())));
                                }));
    }
}
