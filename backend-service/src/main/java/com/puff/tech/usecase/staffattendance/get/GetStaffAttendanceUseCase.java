package com.puff.tech.usecase.staffattendance.get;

import com.puff.tech.covertor.StaffAttedanceConvertor;
import com.puff.tech.repository.StaffAttendanceRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Flux;

@Singleton
public class GetStaffAttendanceUseCase {

    private final StaffAttendanceRepository staffAttendanceRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public GetStaffAttendanceUseCase(StaffAttendanceRepository staffAttendanceRepository,
                                     KhataBookImplementation khataBookImplementation) {
        this.staffAttendanceRepository = staffAttendanceRepository;
        this.khataBookImplementation = khataBookImplementation;
    }
    public Flux<GetStaffAttendanceUseCaseResponse> execute(){
        return khataBookImplementation.getCurrentKhataBookId()
                .flatMapMany(khataBookId->
                        staffAttendanceRepository.findByKhataBookIdOrderByDateDesc(khataBookId)
                                .map(StaffAttedanceConvertor::toResponse)
                                .onErrorResume(err->Flux.error(new RuntimeException("Unexpected happened" +err.getLocalizedMessage()))));
    }
}
