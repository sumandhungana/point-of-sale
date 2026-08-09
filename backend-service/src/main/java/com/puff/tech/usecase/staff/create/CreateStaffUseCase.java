package com.puff.tech.usecase.staff.create;

import com.puff.tech.core.usecases.UseCase;
import com.puff.tech.covertor.StaffConvertor;
import com.puff.tech.repository.StaffRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class CreateStaffUseCase implements UseCase<CreateStaffUseCaseRequest,CreateStaffUseCaseResponse> {

    private final StaffRepository staffRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public CreateStaffUseCase(StaffRepository staffRepository,
                              KhataBookImplementation khataBookImplementation) {
        this.staffRepository = staffRepository;
        this.khataBookImplementation = khataBookImplementation;
    }

    @Override
    public Mono<CreateStaffUseCaseResponse> execute(CreateStaffUseCaseRequest request) {
        return khataBookImplementation.getCurrentKhataBookId()
                .flatMap(khataBookId->{
                    var staff= StaffConvertor.toEntity(request,khataBookId);
                    return staffRepository.save(staff)
                            .map(saved->new CreateStaffUseCaseResponse("Staff created"))
                            .onErrorResume(err->Mono.error(new RuntimeException("Unexpected happened" +err.getLocalizedMessage())));
                });
    }
}
