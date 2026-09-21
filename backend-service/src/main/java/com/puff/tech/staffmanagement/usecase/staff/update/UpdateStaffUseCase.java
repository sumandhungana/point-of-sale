package com.puff.tech.staffmanagement.usecase.staff.update;

import com.puff.tech.core.usecases.UseCases;
import com.puff.tech.staffmanagement.converter.StaffConvertor;
import com.puff.tech.staffmanagement.repository.StaffRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class UpdateStaffUseCase implements UseCases<UpdateStaffUseCaseRequest,UpdateStaffUseCaseResponse> {

    private final StaffRepository staffRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public UpdateStaffUseCase(StaffRepository staffRepository,
                              KhataBookImplementation khataBookImplementation) {
        this.staffRepository = staffRepository;
        this.khataBookImplementation = khataBookImplementation;
    }

    @Override
    public Mono<UpdateStaffUseCaseResponse> execute(UpdateStaffUseCaseRequest request) {
        return khataBookImplementation.getCurrentKhataBookId()
                .flatMap(khataBookId->
                        staffRepository.findByIdAndMemberId(request.id(),khataBookId.toString())
                                .switchIfEmpty(Mono.error(new RuntimeException("Staff not found")))
                                .flatMap(staffEntity -> {
                                    var staff= StaffConvertor.toEntityUpdate(request,staffEntity);
                                    return staffRepository.update(staff)
                                            .map(saved->new UpdateStaffUseCaseResponse("Updated successfully"))
                                            .onErrorResume(err->Mono.error(new RuntimeException("Unexpected happened" +err.getLocalizedMessage())));
                                }));
    }
}
