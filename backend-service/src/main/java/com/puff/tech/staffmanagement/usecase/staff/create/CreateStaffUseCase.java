package com.puff.tech.staffmanagement.usecase.staff.create;

import com.puff.tech.core.usecases.MonoUC;
import com.puff.tech.staffmanagement.converter.StaffConvertor;
import com.puff.tech.staffmanagement.repository.OrganizationStaffRepository;
import com.puff.tech.security.UseCaseContext;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class CreateStaffUseCase implements MonoUC<CreateStaffUseCaseRequest,CreateStaffUseCaseResponse> {

    private final OrganizationStaffRepository staffRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public CreateStaffUseCase(OrganizationStaffRepository staffRepository,
                              KhataBookImplementation khataBookImplementation) {
        this.staffRepository = staffRepository;
        this.khataBookImplementation = khataBookImplementation;
    }

//    @Override
//    public Mono<CreateStaffUseCaseResponse> execute(CreateStaffUseCaseRequest request) {
//        return khataBookImplementation.getCurrentKhataBookId()
//                .flatMap(khataBookId->{
//                    var staff= StaffConvertor.toEntity(request,khataBookId);
//                    return staffRepository.save(staff)
//                            .map(saved->new CreateStaffUseCaseResponse("Staff created"))
//                            .onErrorResume(err->Mono.error(new RuntimeException("Unexpected happened" +err.getLocalizedMessage())));
//                });
//    }

    @Override
    public Mono<CreateStaffUseCaseResponse> execute(CreateStaffUseCaseRequest request, UseCaseContext context) {
        System.out.println(context.securityContext().userId());
        return staffRepository.save(StaffConvertor.toEntity(request, context.securityContext()))
                .map(saved->new CreateStaffUseCaseResponse("Staff created Successfully"))
                            .onErrorResume(err->Mono.error(new RuntimeException("Unexpected happened:: " +err.getLocalizedMessage())));
    }
}
