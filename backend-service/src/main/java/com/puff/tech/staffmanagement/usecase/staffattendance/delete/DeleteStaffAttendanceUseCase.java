package com.puff.tech.staffmanagement.usecase.staffattendance.delete;

import com.puff.tech.core.usecases.UseCases;
import com.puff.tech.staffmanagement.repository.StaffAttendanceRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class DeleteStaffAttendanceUseCase implements UseCases<DeleteStaffAttendanceUseCaseRequest,DeleteStaffAttendanceUseCaseResponse> {

    private final StaffAttendanceRepository staffAttendanceRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public DeleteStaffAttendanceUseCase(StaffAttendanceRepository staffAttendanceRepository,
                                        KhataBookImplementation khataBookImplementation) {
        this.staffAttendanceRepository = staffAttendanceRepository;
        this.khataBookImplementation = khataBookImplementation;
    }

    @Override
    public Mono<DeleteStaffAttendanceUseCaseResponse> execute(DeleteStaffAttendanceUseCaseRequest request) {
        return khataBookImplementation.getCurrentKhataBookId()
                .flatMap(khataBookId->
                        staffAttendanceRepository.findByIdAndKhataBookId(request.id(), khataBookId)
                                .switchIfEmpty(Mono.error(new RuntimeException("Attendance not found")))
                                .flatMap(staffAttendanceEntity ->
                                        staffAttendanceRepository.deleteByIdAndKhataBookId(request.id(), khataBookId))
                                .then(Mono.just(new DeleteStaffAttendanceUseCaseResponse("Attendance removed"))));
    }
}
