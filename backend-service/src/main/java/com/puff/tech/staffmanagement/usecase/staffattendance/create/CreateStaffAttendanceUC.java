package com.puff.tech.staffmanagement.usecase.staffattendance.create;

import com.puff.tech.core.usecases.MonoUC;
import com.puff.tech.domain.AttendanceStatus;
import com.puff.tech.security.UseCaseContext;
import com.puff.tech.staffmanagement.converter.StaffAttendanceConvertor;
import com.puff.tech.staffmanagement.repository.StaffAttendanceRepository;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Singleton
public class CreateStaffAttendanceUC implements MonoUC<CreateStaffAttendanceUCRequest, CreateStaffAttendanceUCResponse> {

    private final StaffAttendanceRepository staffAttendanceRepository;

    @Inject
    public CreateStaffAttendanceUC(StaffAttendanceRepository staffAttendanceRepository) {
        this.staffAttendanceRepository = staffAttendanceRepository;
    }

    @Override
    public Mono<CreateStaffAttendanceUCResponse> execute(CreateStaffAttendanceUCRequest request, UseCaseContext context) {
        Long memberId = context.securityContext().memberId();
        Instant targetDate = request.date() != null ? request.date() : Instant.now();
        Instant normalizedDate = targetDate.truncatedTo(ChronoUnit.DAYS);
        return staffAttendanceRepository.findByStaffIdAndDateAndMemberId(request.staffId(), normalizedDate, memberId)
                .flatMap(existing -> {
                    // Record exists: Update it
                    existing.setStatus(request.status() != null ? request.status() : AttendanceStatus.PRESENT);
                    if (request.note() != null) {
                        existing.setNote(request.note());
                    }
                    existing.setUpdatedAt(Instant.now());

                    return staffAttendanceRepository.update(existing)
                            .map(updated -> new CreateStaffAttendanceUCResponse("Attendance updated successfully"));
                })
                .switchIfEmpty(Mono.defer(() -> {
                    // Record does not exist: Insert/Save a new one
                    var staffAttendance = StaffAttendanceConvertor.toEntity(request, memberId);
                    staffAttendance.setDate(normalizedDate);

                    return staffAttendanceRepository.save(staffAttendance)
                            .map(saved -> new CreateStaffAttendanceUCResponse("Attendance marked successfully"))
                            .onErrorResume(err -> Mono.error(new RuntimeException("Failed to save attendance: " + err.getLocalizedMessage())));
                }));
    }
}


