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

    @Inject
    public CreateStaffUseCase(OrganizationStaffRepository staffRepository) {
        this.staffRepository = staffRepository;
    }

    @Override
    public Mono<CreateStaffUseCaseResponse> execute(CreateStaffUseCaseRequest request, UseCaseContext context) {
        System.out.println(context.securityContext().userId());
        return staffRepository.save(StaffConvertor.toEntity(request, context.securityContext()))
                .map(saved->new CreateStaffUseCaseResponse("Staff created Successfully", saved.getId()))
                            .onErrorResume(err->Mono.error(new RuntimeException("Unexpected happened:: " +err.getLocalizedMessage())));
    }
}
