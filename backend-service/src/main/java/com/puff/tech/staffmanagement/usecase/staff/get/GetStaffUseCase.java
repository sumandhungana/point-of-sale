package com.puff.tech.staffmanagement.usecase.staff.get;

import com.puff.tech.core.usecases.FluxUC;
import com.puff.tech.onboarding.repository.MemberRepository;
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

        Long memberId = context.securityContext().memberId();
        return staffRepository
                .findByMemberIdOrderByCreatedAtDesc(memberId)
                .map(StaffConvertor::toResponse)
                .onErrorMap(err -> new RuntimeException(
                        "Unexpected error occurred while fetching staff: " + err.getLocalizedMessage(),
                        err
                ));
    }
}
