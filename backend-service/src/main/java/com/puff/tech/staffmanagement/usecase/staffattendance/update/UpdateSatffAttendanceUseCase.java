package com.puff.tech.staffmanagement.usecase.staffattendance.update;

import com.puff.tech.core.usecases.UseCases;
import com.puff.tech.staffmanagement.repository.StaffAttendanceRepository;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class UpdateSatffAttendanceUseCase implements UseCases<UpdateSatffAttendanceUseCaseRequest,UpdateSatffAttendanceUseCaseResponse> {

    private final StaffAttendanceRepository staffAttendanceRepository;

    @Inject
    public UpdateSatffAttendanceUseCase(StaffAttendanceRepository staffAttendanceRepository
                                     ) {
        this.staffAttendanceRepository = staffAttendanceRepository;
    }

    @Override
    public Mono<UpdateSatffAttendanceUseCaseResponse> execute(UpdateSatffAttendanceUseCaseRequest request) {
       return null;
    }
}
