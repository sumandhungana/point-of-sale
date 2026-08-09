package com.puff.tech.usecase.staffattendance.getbydate;

import com.puff.tech.covertor.StaffAttedanceConvertor;
import com.puff.tech.repository.StaffAttendanceRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import com.puff.tech.usecase.staffattendance.get.GetStaffAttendanceUseCaseResponse;
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


    public Flux<GetStaffAttendanceUseCaseResponse> execute(GetStaffAttendanceByDateUseCaseRequest request) {
        return khataBookImplementation.getCurrentKhataBookId()
                .flatMapMany(khataBookId->
                        staffAttendanceRepository.findByDateAndKhataBookIdOrderByStaffIdAsc(request.date(), khataBookId)
                                .map(StaffAttedanceConvertor::toResponse)
                                .onErrorResume(err->Flux.error(new RuntimeException("Unexpected happened" +err.getLocalizedMessage()))));
    }
}
