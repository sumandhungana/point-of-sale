package com.puff.tech.staffmanagement.usecase.staffattendance.getbydate;

import com.puff.tech.staffmanagement.repository.StaffAttendanceRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import com.puff.tech.staffmanagement.usecase.staffattendance.get.GetStaffAttendanceUCResponse;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Flux;


@Singleton
public class GetStaffAttendanceByDateUseCase {

    private final StaffAttendanceRepository staffAttendanceRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public GetStaffAttendanceByDateUseCase(StaffAttendanceRepository staffAttendanceRepository,
                                           KhataBookImplementation khataBookImplementation) {
        this.staffAttendanceRepository = staffAttendanceRepository;
        this.khataBookImplementation = khataBookImplementation;
    }


    public Flux<GetStaffAttendanceUCResponse> execute(GetStaffAttendanceByDateUseCaseRequest request) {
        return null;
    }
}
