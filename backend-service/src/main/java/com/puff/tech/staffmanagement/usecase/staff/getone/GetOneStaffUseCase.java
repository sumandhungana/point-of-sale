package com.puff.tech.staffmanagement.usecase.staff.getone;

import com.puff.tech.core.usecases.MonoUC;
import com.puff.tech.staffmanagement.converter.StaffConvertor;
import com.puff.tech.staffmanagement.repository.OrganizationStaffRepository;
import com.puff.tech.security.UseCaseContext;
import com.puff.tech.staffmanagement.usecase.staff.get.GetStaffUseCaseResponse;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class GetOneStaffUseCase implements MonoUC<GetOneStaffUseCaseRequest, GetStaffUseCaseResponse> {

    private final OrganizationStaffRepository staffRepository;


    @Inject
    public GetOneStaffUseCase(OrganizationStaffRepository staffRepository) {
        this.staffRepository = staffRepository;
    }

    @Override
    public Mono<GetStaffUseCaseResponse> execute(GetOneStaffUseCaseRequest request, UseCaseContext context) {
        return staffRepository.findByIdAndMemberId(request.id(), context.securityContext().userId())
                .map(StaffConvertor::toResponse)
                .onErrorResume(err -> Mono.error(new RuntimeException("Unexpected happened" +err.getLocalizedMessage())));
    }

}
