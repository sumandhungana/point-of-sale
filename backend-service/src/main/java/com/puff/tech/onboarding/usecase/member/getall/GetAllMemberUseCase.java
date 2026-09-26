package com.puff.tech.onboarding.usecase.member.getall;

import com.puff.tech.core.usecases.FluxUC;
import com.puff.tech.core.usecases.MonoUC;
import com.puff.tech.onboarding.repository.MemberEntity;
import com.puff.tech.onboarding.repository.MemberRepository;
import com.puff.tech.onboarding.repository.UserMemberEntity;
import com.puff.tech.onboarding.usecase.member.get.GetSelectedMemberUCResponse;
import com.puff.tech.security.UseCaseContext;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Singleton
public class GetAllMemberUseCase implements FluxUC<GetAllMemberUseCaseRequest, GetAllMemberUseCaseResponse> {

    private final MemberRepository memberRepository;

    @Inject
    public GetAllMemberUseCase(MemberRepository memberRepository){
        this.memberRepository=memberRepository;
    }
    @Override
    public Flux<GetAllMemberUseCaseResponse> execute(GetAllMemberUseCaseRequest request, UseCaseContext context) {
        return Flux.from(memberRepository.findAll())
                .map(this::toResponse)
                .onErrorResume(err->Flux.error(new Throwable("Failed to fetch member: " +err.getLocalizedMessage())));
    }

    private GetAllMemberUseCaseResponse toResponse(MemberEntity member) {
        return GetAllMemberUseCaseResponse.builder()
                .id(member.getId()).
                memberId(member.getMemberId())
                .organizationName(member.getOrganizationName())
                .panVatNumber(member.getPanVatNumber())
                .organizationType(member.getOrganizationType())
                .branch(member.getBranch())
                .organizationAddress(member.getOrganizationAddress())
                .notes(member.getNotes())
                .build();

    }
}
