package com.puff.tech.usecase.staffattendance.create;

import com.puff.tech.core.usecases.UseCase;
import com.puff.tech.covertor.StaffAttedanceConvertor;
import com.puff.tech.repository.StaffAttendanceRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;
import reactor.core.publisher.MonoOperator;

@Singleton
public class CreateStaffAtendanceUseCase implements UseCase<CreateStaffAtendanceUseCaseRequest,CreateStaffAtendanceUseCaseResponse> {

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
                .flatMap(khataBookId->
                        staffAttendanceRepository.findByStaffIdAndDateAndKhataBookId(
                                request.staffId(),
                                request.date(),
                                khataBookId

                        )
                                .flatMap(existing->Mono.<CreateStaffAtendanceUseCaseResponse>error(new RuntimeException("Attendance already done")))
                                .switchIfEmpty(Mono.defer(()->{
                                    var staffAttendance= StaffAttedanceConvertor.toEntity(request,khataBookId);
                                    return staffAttendanceRepository.save(staffAttendance)
                                            .map(saved-> new CreateStaffAtendanceUseCaseResponse("Attendance done"))
                                            .onErrorResume(err->Mono.error(new RuntimeException("Unexpected happened" +err.getLocalizedMessage())));
                                })));
        }
    }

