package com.puff.tech.staffmanagement.usecase.staffattendance.update;

import com.puff.tech.core.usecases.UseCases;
import com.puff.tech.staffmanagement.converter.StaffAttedanceConvertor;
import com.puff.tech.staffmanagement.repository.StaffAttendanceRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class UpdateSatffAttendanceUseCase implements UseCases<UpdateSatffAttendanceUseCaseRequest,UpdateSatffAttendanceUseCaseResponse> {

    private final StaffAttendanceRepository staffAttendanceRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public UpdateSatffAttendanceUseCase(StaffAttendanceRepository staffAttendanceRepository,
                                        KhataBookImplementation khataBookImplementation) {
        this.staffAttendanceRepository = staffAttendanceRepository;
        this.khataBookImplementation = khataBookImplementation;
    }

    @Override
    public Mono<UpdateSatffAttendanceUseCaseResponse> execute(UpdateSatffAttendanceUseCaseRequest request) {
        return khataBookImplementation.getCurrentKhataBookId()
                .flatMap(khataBookId->
                        staffAttendanceRepository.findByIdAndKhataBookId(request.id(), khataBookId)
                                .switchIfEmpty(Mono.error(new RuntimeException("Attendance not found")))
                                .flatMap(existing->{
                                    var updated= StaffAttedanceConvertor.toEntityUpdate(request,existing);
                                    return staffAttendanceRepository.update(updated)
                                            .map(saved->new UpdateSatffAttendanceUseCaseResponse("Attendance updated"))
                                            .onErrorResume(err->Mono.error(new RuntimeException("Unexpected happened" +err.getLocalizedMessage())));
                                }));
    }
}
