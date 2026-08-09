package com.puff.tech.usecase.staff.delete;

import com.puff.tech.core.usecases.UseCase;
import com.puff.tech.repository.StaffRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class DeleteStaffUseCase implements UseCase<DeleteStaffUseCaseRequest,DeleteStaffUseCaseResponse> {

    private final StaffRepository staffRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public DeleteStaffUseCase(StaffRepository staffRepository,
                              KhataBookImplementation khataBookImplementation) {
        this.staffRepository = staffRepository;
        this.khataBookImplementation = khataBookImplementation;
    }

    @Override
    public Mono<DeleteStaffUseCaseResponse> execute(DeleteStaffUseCaseRequest request) {
        return khataBookImplementation.getCurrentKhataBookId()
                .flatMap(khataBookId->
                        staffRepository.findByIdAndKhataBookId(request.id(), khataBookId)
                                .switchIfEmpty(Mono.error(new RuntimeException("Staff not found")))
                                .flatMap(staffEntity ->
                                        staffRepository.deleteByIdAndKhataBookId(request.id(), khataBookId)
                                                .then(Mono.just(new DeleteStaffUseCaseResponse("Staff deleted"))))
                );
    }
}
