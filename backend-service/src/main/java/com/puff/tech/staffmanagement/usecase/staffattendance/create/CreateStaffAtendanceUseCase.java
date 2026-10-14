package com.puff.tech.staffmanagement.usecase.staffattendance.create;

import com.puff.tech.core.usecases.UseCases;
import com.puff.tech.domain.AttendanceStatus;
import com.puff.tech.service.implementation.KhataBookImplementation;
import com.puff.tech.staffmanagement.converter.StaffAttendanceConvertor;
import com.puff.tech.staffmanagement.repository.StaffAttendanceRepository;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Singleton
public class CreateStaffAtendanceUseCase implements UseCases<CreateStaffAtendanceUseCaseRequest, CreateStaffAtendanceUseCaseResponse> {

    private final StaffAttendanceRepository staffAttendanceRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public CreateStaffAtendanceUseCase(StaffAttendanceRepository staffAttendanceRepository,
                                       KhataBookImplementation khataBookImplementation) {
        this.staffAttendanceRepository = staffAttendanceRepository;
        this.khataBookImplementation = khataBookImplementation;
    }

    @Override
    public Mono<CreateStaffAtendanceUseCaseResponse> execute(CreateStaffAtendanceUseCaseRequest request) {
        return khataBookImplementation.getCurrentKhataBookId()
                .flatMap(khataBookId -> {
                    Instant targetDate = request.date() != null ? request.date() : Instant.now();
                    Instant normalizedDate = targetDate.truncatedTo(ChronoUnit.DAYS);

                    return staffAttendanceRepository.findByStaffIdAndDateAndMemberId(
                            request.staffId(),
                            normalizedDate,
                            khataBookId
                    )
                    .flatMap(existing -> {
                        existing.setStatus(request.status() != null ? request.status() : AttendanceStatus.PRESENT);
                        if (request.note() != null) {
                            existing.setNote(request.note());
                        }
                        existing.setUpdatedAt(Instant.now());
                        return staffAttendanceRepository.update(existing)
                                .map(updated -> new CreateStaffAtendanceUseCaseResponse("Attendance updated successfully"));
                    })
                    .switchIfEmpty(Mono.defer(() -> {
                        var staffAttendance = StaffAttendanceConvertor.toEntity(request, khataBookId);
                        staffAttendance.setDate(normalizedDate);
                        return staffAttendanceRepository.save(staffAttendance)
                                .map(saved -> new CreateStaffAtendanceUseCaseResponse("Attendance marked successfully"))
                                .onErrorResume(err -> Mono.error(new RuntimeException("Failed to save attendance: " + err.getLocalizedMessage())));
                    }));
                });
    }
}
