package com.puff.tech.staffmanagement.usecase.staffattendance.getbyid;

import com.puff.tech.core.usecases.UseCases;
import com.puff.tech.staffmanagement.converter.StaffAttedanceConvertor;
import com.puff.tech.staffmanagement.repository.StaffAttendanceRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import com.puff.tech.staffmanagement.usecase.staffattendance.get.GetStaffAttendanceUseCaseResponse;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class GetStaffAttendanceByIdUseCase implements UseCases<GetStaffAttendanceByIdUseCaseRequest, GetStaffAttendanceUseCaseResponse> {

    private final StaffAttendanceRepository staffAttendanceRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public GetStaffAttendanceByIdUseCase(StaffAttendanceRepository staffAttendanceRepository,
                                         KhataBookImplementation khataBookImplementation) {
        this.staffAttendanceRepository = staffAttendanceRepository;
        this.khataBookImplementation = khataBookImplementation;
    }

    @Override
    public Mono<GetStaffAttendanceUseCaseResponse> execute(GetStaffAttendanceByIdUseCaseRequest request) {
        return khataBookImplementation.getCurrentKhataBookId()
                .flatMap(khataBookId->
                        staffAttendanceRepository.findByIdAndKhataBookId(request.id(), khataBookId)
                                .map(StaffAttedanceConvertor::toResponse)
                                .onErrorResume(err->Mono.error(new RuntimeException("Unexpected happened" +err.getLocalizedMessage()))));
    }
}
