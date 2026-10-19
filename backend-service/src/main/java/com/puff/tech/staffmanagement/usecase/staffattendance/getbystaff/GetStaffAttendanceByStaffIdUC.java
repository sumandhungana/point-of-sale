package com.puff.tech.staffmanagement.usecase.staffattendance.getbystaff;

import com.puff.tech.core.usecases.FluxUC;
import com.puff.tech.security.UseCaseContext;
import com.puff.tech.staffmanagement.repository.StaffAttendanceEntity;
import com.puff.tech.staffmanagement.repository.StaffAttendanceRepository;
import com.puff.tech.staffmanagement.usecase.staffattendance.get.GetStaffAttendanceUCResponse;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Flux;

@Singleton
public class GetStaffAttendanceByStaffIdUC implements FluxUC<GetStaffAttendanceByStaffIdUCRequest, GetStaffAttendanceUCResponse> {

    private final StaffAttendanceRepository staffAttendanceRepository;

    @Inject
    public GetStaffAttendanceByStaffIdUC(StaffAttendanceRepository staffAttendanceRepository) {
        this.staffAttendanceRepository = staffAttendanceRepository;
    }

    @Override
    public Flux<GetStaffAttendanceUCResponse> execute(GetStaffAttendanceByStaffIdUCRequest request, UseCaseContext context) {
        Long memberId = context.securityContext().memberId();
        return staffAttendanceRepository
                .findByStaffIdAndMemberId(request.staffId(), memberId)
                .switchIfEmpty(reactor.core.publisher.Mono.error(
                        new RuntimeException("Staff attendance not found")
                ))
                .map(this::toResponse);

    }

    private GetStaffAttendanceUCResponse toResponse(
            StaffAttendanceEntity attendance) {

        return new GetStaffAttendanceUCResponse(
                attendance.getId(),
                attendance.getStaff().getId(),
                attendance.getDate(),
                attendance.getStatus(),
                attendance.getNote(),
                attendance.getCreatedAt(),
                attendance.getUpdatedAt()
        );
    }

}
