package com.puff.tech.onboarding.usecase.getallorganization;

import com.puff.tech.core.usecases.FluxUC;
import com.puff.tech.onboarding.repository.MemberEntity;
import com.puff.tech.onboarding.repository.MemberRepository;
import com.puff.tech.onboarding.usecase.member.getall.GetUserWiseAllMemberUCResponse;
import com.puff.tech.security.UseCaseContext;
import jakarta.inject.Singleton;
import reactor.core.publisher.Flux;

@Singleton
public class GetAllOrganizationUC implements FluxUC<GetAllOrganizationUCRequest, GetAllOrganizationUCResponse> {

    private final MemberRepository memberRepository;

    public GetAllOrganizationUC(MemberRepository memberRepository) {
        this.memberRepository = memberRepository;
    }

    @Override
    public Flux<GetAllOrganizationUCResponse> execute(GetAllOrganizationUCRequest request, UseCaseContext context) {
        return memberRepository.findByRefMemberIdOrderByCreatedAtDesc(0L)
                .map(this::toResponse)
                .onErrorResume(err->Flux.error(new Throwable("Failed to fetch organizations:: " +err.getLocalizedMessage())));

    }

    private GetAllOrganizationUCResponse toResponse(MemberEntity member) {
        return GetAllOrganizationUCResponse.builder()
                .id(member.getId())
                .referenceMemberId(member.getRefMemberId())
                .organizationName(member.getOrganizationName())
                .panVatNumber(member.getPanVatNumber())
                .organizationType(member.getOrganizationType())
                .branch(member.getBranch())
                .organizationAddress(member.getOrganizationAddress())
                .organizationEmail(member.getOrganizationEmail())
                .organizationContactNumber(member.getOrganizationContactNumber())
                .notes(member.getNotes())
                .createdAt(member.getCreatedAt())
                .createdBy(member.getCreatedBy())
                .updatedAt(member.getUpdatedAt())
                .updatedBy(member.getUpdatedBy())
                .build();

    }
}
