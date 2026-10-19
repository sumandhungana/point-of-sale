package com.puff.tech.staffmanagement.usecase.staff.getattendance;

import com.puff.tech.staffmanagement.repository.StaffAttendanceRepository;
import com.puff.tech.staffmanagement.usecase.staffattendance.get.GetStaffAttendanceUCResponse;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Flux;


@Singleton
public class GetAttendanceUseCase  {

    private  final StaffAttendanceRepository staffAttendanceRepository;

    @Inject
    public GetAttendanceUseCase(StaffAttendanceRepository staffAttendanceRepository) {
        this.staffAttendanceRepository = staffAttendanceRepository;
    }


    public Flux<GetStaffAttendanceUCResponse> execute(GetAttendanceUseCaseRequest request) {
        return null;
    }
}
