package com.puff.tech.staffmanagement.usecase.staffsalary.create;

import com.puff.tech.core.usecases.MonoUC;
import com.puff.tech.core.usecases.UseCases;
import com.puff.tech.onboarding.repository.MemberRepository;
import com.puff.tech.security.UseCaseContext;
import com.puff.tech.staffmanagement.converter.StaffSalaryConvertor;
import com.puff.tech.staffmanagement.repository.OrganizationStaffRepository;
import com.puff.tech.staffmanagement.repository.StaffSalaryRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class CreateStaffSalaryUseCase implements MonoUC<CreateStaffSalaryUseCaseRequest,CreateStaffSalaryUseCaseResponse> {

    private final StaffSalaryRepository staffSalaryRepository;
    private final MemberRepository memberRepository;
    private final OrganizationStaffRepository staffRepository;

    @Inject
    public CreateStaffSalaryUseCase(StaffSalaryRepository staffSalaryRepository,
                                     MemberRepository memberRepository,
                                    OrganizationStaffRepository staffRepository) {
        this.staffSalaryRepository = staffSalaryRepository;
        this.memberRepository = memberRepository;
        this.staffRepository = staffRepository;

    }

    @Override
    public Mono<CreateStaffSalaryUseCaseResponse> execute(CreateStaffSalaryUseCaseRequest request, UseCaseContext context) {
        var staffSalary = StaffSalaryConvertor.toEntity(request, context.securityContext().memberId());

        return staffSalaryRepository.save(staffSalary)
                .map(saved->new CreateStaffSalaryUseCaseResponse("Staff salary created", saved.getId()))
                .onErrorResume(err->Mono.error(new RuntimeException("Unexpected happened" +err.getLocalizedMessage())));
    }
}
