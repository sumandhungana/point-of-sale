package com.puff.tech.usecase.staff.get;

import com.puff.tech.covertor.StaffConvertor;
import com.puff.tech.repository.StaffRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Flux;

@Singleton
public class GetStaffUseCase {

    private final StaffRepository staffRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public GetStaffUseCase(StaffRepository staffRepository,
                           KhataBookImplementation khataBookImplementation) {
        this.staffRepository = staffRepository;
        this.khataBookImplementation = khataBookImplementation;
    }

    public Flux<GetStaffUseCaseResponse> execute(){
        return khataBookImplementation.getCurrentKhataBookId()
                .flatMapMany(khataBookId-> staffRepository.findByKhataBookIdOrderByCreatedAtDesc(khataBookId)
                        .map(StaffConvertor::toResponse)
                        .onErrorResume(err->Flux.error(new RuntimeException("Unexpected happened" +err.getLocalizedMessage()))));
    }
}
