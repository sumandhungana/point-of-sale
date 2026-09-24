package com.puff.tech.staffmanagement.usecase.staff.get;

import com.puff.tech.core.usecases.FluxUC;
import com.puff.tech.onboarding.repository.MemberRepository;
import com.puff.tech.staffmanagement.converter.StaffConvertor;
import com.puff.tech.staffmanagement.repository.OrganizationStaffRepository;
import com.puff.tech.security.UseCaseContext;
import com.puff.tech.staffmanagement.repository.StaffSalaryRepository;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Flux;

@Singleton
public class GetStaffUseCase implements FluxUC<GetStaffUCRequest, GetStaffUseCaseResponse> {

    private final OrganizationStaffRepository staffRepository;
    private final StaffSalaryRepository staffSalaryRepository;

    @Inject
    public GetStaffUseCase(OrganizationStaffRepository staffRepository,
                           StaffSalaryRepository staffSalaryRepository) {
        this.staffRepository = staffRepository;
        this.staffSalaryRepository = staffSalaryRepository;
    }

    @Override
    public Flux<GetStaffUseCaseResponse> execute(GetStaffUCRequest request, UseCaseContext context) {

        Long memberId = context.securityContext().memberId();
        return staffRepository
                .findByMemberIdOrderByCreatedAtDesc(memberId)
                .flatMap(staff ->
                        staffSalaryRepository.findByStaffIdAndMemberId(staff.getId(), memberId)
                                .collectList()
                                .map(salaries -> {
                                    staff.setSalaries(salaries);
                                    return staff;
                                })
                )
                .map(StaffConvertor::toResponse)
                .onErrorMap(err -> new RuntimeException(
                        "Unexpected error occurred while fetching staff: " + err.getLocalizedMessage(),
                        err
                ));
    }

}
