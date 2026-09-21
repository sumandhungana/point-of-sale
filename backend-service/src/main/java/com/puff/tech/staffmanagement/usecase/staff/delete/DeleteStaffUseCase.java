package com.puff.tech.staffmanagement.usecase.staff.delete;

import com.puff.tech.core.usecases.UseCases;
import com.puff.tech.staffmanagement.repository.StaffRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class DeleteStaffUseCase implements UseCases<DeleteStaffUseCaseRequest,DeleteStaffUseCaseResponse> {

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
                        staffRepository.findByIdAndMemberId(request.id(), khataBookId.toString())
                                .switchIfEmpty(Mono.error(new RuntimeException("Staff not found")))
                                .flatMap(staffEntity ->
                                        staffRepository.deleteByIdAndMemberId(request.id(), khataBookId.toString())
                                                .then(Mono.just(new DeleteStaffUseCaseResponse("Staff deleted"))))
                );
    }
}
