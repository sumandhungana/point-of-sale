package com.puff.tech.staffmanagement.usecase.staff.getattendance;

import com.puff.tech.staffmanagement.converter.StaffAttedanceConvertor;
import com.puff.tech.staffmanagement.repository.StaffAttendanceRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import com.puff.tech.staffmanagement.usecase.staffattendance.get.GetStaffAttendanceUseCaseResponse;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Flux;


@Singleton
public class GetAttendanceUseCase  {

    private  final StaffAttendanceRepository staffAttendanceRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public GetAttendanceUseCase(StaffAttendanceRepository staffAttendanceRepository,
                                KhataBookImplementation khataBookImplementation) {
        this.staffAttendanceRepository = staffAttendanceRepository;
        this.khataBookImplementation = khataBookImplementation;
    }


    public Flux<GetStaffAttendanceUseCaseResponse> execute(GetAttendanceUseCaseRequest request) {
        return khataBookImplementation.getCurrentKhataBookId()
                .flatMapMany(khataBookId->
                        staffAttendanceRepository.findByStaffIdAndKhataBookIdOrderByDateDesc(request.id(), khataBookId)
                                .map(StaffAttedanceConvertor::toResponse)
                                .onErrorResume(err->Flux.error(new RuntimeException("Unexpected happened" +new RuntimeException()))));
    }
}
