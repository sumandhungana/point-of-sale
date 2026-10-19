package com.puff.tech.staffmanagement.usecase.staffattendance.getbyid;

import com.puff.tech.core.usecases.FluxUC;
import com.puff.tech.core.usecases.MonoUC;
import com.puff.tech.core.usecases.UseCases;
import com.puff.tech.security.UseCaseContext;
import com.puff.tech.staffmanagement.repository.StaffAttendanceEntity;
import com.puff.tech.staffmanagement.repository.StaffAttendanceRepository;
import com.puff.tech.staffmanagement.usecase.staffattendance.get.GetStaffAttendanceUCResponse;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Singleton
public class GetStaffAttendanceByIdUseCase implements FluxUC<GetStaffAttendanceByIdUCRequest, GetStaffAttendanceUCResponse> {

    private final StaffAttendanceRepository staffAttendanceRepository;

    @Inject
    public GetStaffAttendanceByIdUseCase(StaffAttendanceRepository staffAttendanceRepository) {
        this.staffAttendanceRepository = staffAttendanceRepository;
    }

    @Override
    public Flux<GetStaffAttendanceUCResponse> execute(GetStaffAttendanceByIdUCRequest request, UseCaseContext context) {

        Long memberId = context.securityContext().memberId();

        return staffAttendanceRepository
                .findByStaffIdAndMemberId(request.id(), memberId)
                .switchIfEmpty(reactor.core.publisher.Flux.error(
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
