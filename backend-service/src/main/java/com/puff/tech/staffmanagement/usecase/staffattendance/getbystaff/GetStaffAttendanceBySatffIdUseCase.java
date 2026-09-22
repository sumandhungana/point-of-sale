package com.puff.tech.staffmanagement.usecase.staffattendance.getbystaff;

import com.puff.tech.staffmanagement.converter.StaffAttendanceConvertor;
import com.puff.tech.staffmanagement.repository.StaffAttendanceRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import com.puff.tech.staffmanagement.usecase.staffattendance.get.GetStaffAttendanceUseCaseResponse;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Flux;

@Singleton
public class GetStaffAttendanceBySatffIdUseCase {

    private final StaffAttendanceRepository staffAttendanceRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public GetStaffAttendanceBySatffIdUseCase(StaffAttendanceRepository staffAttendanceRepository,
                                              KhataBookImplementation khataBookImplementation) {
        this.staffAttendanceRepository = staffAttendanceRepository;
        this.khataBookImplementation = khataBookImplementation;
    }

    public Flux<GetStaffAttendanceUseCaseResponse> execute(GetStaffAttendanceBySatffIdUseCaseRequest request){
        return khataBookImplementation.getCurrentKhataBookId()
                .flatMapMany(khataBookId->
                        staffAttendanceRepository.findByStaffIdAndMemberIdOrderByDateDesc(request.staffId(),khataBookId)
                                .map(StaffAttendanceConvertor::toResponse)
                                .onErrorResume(err->Flux.error(new RuntimeException("Unexpected happened" +err.getLocalizedMessage()))));

    }
}
