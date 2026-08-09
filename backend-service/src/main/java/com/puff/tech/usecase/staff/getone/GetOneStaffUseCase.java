package com.puff.tech.usecase.staff.getone;

import com.puff.tech.core.usecases.UseCase;
import com.puff.tech.covertor.StaffConvertor;
import com.puff.tech.repository.StaffRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import com.puff.tech.usecase.staff.get.GetStaffUseCaseResponse;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class GetOneStaffUseCase implements UseCase<GetOneStaffUseCaseRequest, GetStaffUseCaseResponse> {

    private final StaffRepository staffRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public GetOneStaffUseCase(StaffRepository staffRepository,
                              KhataBookImplementation khataBookImplementation) {
        this.staffRepository = staffRepository;
        this.khataBookImplementation = khataBookImplementation;
    }

    @Override
    public Mono<GetStaffUseCaseResponse> execute(GetOneStaffUseCaseRequest request) {
        return khataBookImplementation.getCurrentKhataBookId()
                .flatMap(khataBookId-> staffRepository.findByIdAndKhataBookId(request.id(), khataBookId)
                        .map(StaffConvertor::toResponse)
                        .onErrorResume(err->Mono.error(new RuntimeException("Unexpected happened" +err.getLocalizedMessage()))));
    }
}
