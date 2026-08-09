package com.puff.tech.usecase.staffattendance.delete;

import com.puff.tech.core.usecases.UseCase;
import com.puff.tech.entity.StaffAttendanceEntity;
import com.puff.tech.repository.StaffAttendanceRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class DeleteStaffAttendanceUseCase implements UseCase<DeleteStaffAttendanceUseCaseRequest,DeleteStaffAttendanceUseCaseResponse> {

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
