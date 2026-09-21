package com.puff.tech.staffmanagement.usecase.staff.get;

import com.puff.tech.core.usecases.FluxUC;
import com.puff.tech.staffmanagement.converter.StaffConvertor;
import com.puff.tech.staffmanagement.repository.OrganizationStaffRepository;
import com.puff.tech.security.UseCaseContext;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Flux;

@Singleton
public class GetStaffUseCase implements FluxUC<GetStaffUCRequest, GetStaffUseCaseResponse> {

    private final OrganizationStaffRepository staffRepository;

    @Inject
    public GetStaffUseCase(OrganizationStaffRepository staffRepository) {
        this.staffRepository = staffRepository;

    }

    @Override
    public Flux<GetStaffUseCaseResponse> execute(GetStaffUCRequest request, UseCaseContext context) {

        System.out.println("Context = " + context);
        System.out.println("Security Context = " + context.securityContext());
        return staffRepository
                .findByMemberIdOrderByCreatedAtDesc(
                        context.securityContext().userId()
                )
                .map(StaffConvertor::toResponse)
                .onErrorResume(err ->
                        Flux.error(
                                new RuntimeException(
                                        "Unexpected happened:: " + err.getLocalizedMessage(),
                                        err
                                )
                        )
                );
    }
}
