package com.puff.tech.usecase.staff.update;

import com.puff.tech.core.usecases.UseCase;
import com.puff.tech.covertor.StaffConvertor;
import com.puff.tech.repository.StaffRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class UpdateStaffUseCase implements UseCase<UpdateStaffUseCaseRequest,UpdateStaffUseCaseResponse> {

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
                        staffRepository.findByIdAndKhataBookId(request.id(),khataBookId)
                                .switchIfEmpty(Mono.error(new RuntimeException("Staff not found")))
                                .flatMap(staffEntity -> {
                                    var staff= StaffConvertor.toEntityUpdate(request,staffEntity);
                                    return staffRepository.update(staff)
                                            .map(saved->new UpdateStaffUseCaseResponse("Updated successfully"))
                                            .onErrorResume(err->Mono.error(new RuntimeException("Unexpected happened" +err.getLocalizedMessage())));
                                }));
    }
}
