package com.puff.tech.usecase.staffsalary.delete;

import com.puff.tech.core.usecases.UseCase;
import com.puff.tech.repository.StaffSalaryRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class DeleteStaffSalaryUseCase implements UseCase<DeleteStaffSalaryUseCaseRequest,DeleteStaffSalaryUseCaseResponse> {

    private final StaffSalaryRepository staffSalaryRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public DeleteStaffSalaryUseCase(StaffSalaryRepository staffSalaryRepository,
                                    KhataBookImplementation khataBookImplementation) {
        this.staffSalaryRepository = staffSalaryRepository;
        this.khataBookImplementation = khataBookImplementation;
    }

    @Override
    public Mono<DeleteStaffSalaryUseCaseResponse> execute(DeleteStaffSalaryUseCaseRequest request) {
        return khataBookImplementation.getCurrentKhataBookId()
                .flatMap(khataBookId->
                        staffSalaryRepository.findByIdAndKhataBookId(request.id(), khataBookId)
                                .switchIfEmpty(Mono.error(new RuntimeException("Staff salary not found")))
                                .flatMap(staffSalaryEntity ->
                                        staffSalaryRepository.deleteById(request.id())
                                                .then(Mono.just(new DeleteStaffSalaryUseCaseResponse("Staff salary deleted")))));
    }
}
