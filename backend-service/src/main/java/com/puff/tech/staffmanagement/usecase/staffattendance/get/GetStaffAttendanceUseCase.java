package com.puff.tech.staffmanagement.usecase.staffattendance.get;

import com.puff.tech.core.usecases.FluxUC;
import com.puff.tech.security.UseCaseContext;
import com.puff.tech.staffmanagement.repository.StaffAttendanceEntity;
import com.puff.tech.staffmanagement.repository.StaffAttendanceRepository;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Flux;

@Singleton
public class GetStaffAttendanceUseCase implements FluxUC<GetStaffAttendanceUCRequest, GetStaffAttendanceUCResponse> {

    private final StaffAttendanceRepository staffAttendanceRepository;

    @Inject
    public GetStaffAttendanceUseCase(StaffAttendanceRepository staffAttendanceRepository) {
        this.staffAttendanceRepository = staffAttendanceRepository;
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

    @Override
    public Flux<GetStaffAttendanceUCResponse> execute(GetStaffAttendanceUCRequest request, UseCaseContext context) {
        Long memberId = context.securityContext().memberId();

        return staffAttendanceRepository
                .findByMemberId(memberId)
                .switchIfEmpty(reactor.core.publisher.Mono.error(
                        new RuntimeException("Staff attendance not found")
                ))
                .map(this::toResponse);

    }
}
