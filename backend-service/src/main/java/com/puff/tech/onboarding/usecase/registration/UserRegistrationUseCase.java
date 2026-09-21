
package com.puff.tech.onboarding.usecase.registration;

import com.puff.tech.core.usecases.MonoUC;
import com.puff.tech.core.usecases.UseCases;
import com.puff.tech.onboarding.repository.*;
import com.puff.tech.security.UseCaseContext;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

import java.util.Objects;

import static com.puff.tech.core.utils.SecurityUtils.hashPassword;

@Singleton
public class UserRegistrationUseCase implements MonoUC<UserRegistrationUcRequest, UserRegistrationUcResponse> {
    private final UserInfoRepository userInfoRepository;
    private final MemberRepository memberRepository;
    private final UserMemberRepository userMemberRepository;

    public UserRegistrationUseCase(UserInfoRepository userInfoRepository,
                                   MemberRepository memberRepository,
                                   UserMemberRepository userMemberRepository) {
        this.userInfoRepository = userInfoRepository;
        this.memberRepository = memberRepository;
        this.userMemberRepository = userMemberRepository;
    }

    @Override
    public Mono<UserRegistrationUcResponse> execute(UserRegistrationUcRequest request, UseCaseContext context) {
        return Mono.justOrEmpty(request)
                .switchIfEmpty(Mono.error(new IllegalArgumentException("Request payload cannot be empty")))
                .filter(req -> Objects.nonNull(req.gmail()) && !req.gmail().isBlank())
                .switchIfEmpty(Mono.error(new IllegalArgumentException("Email/Gmail is required for registration")))
                .flatMap(validReq ->
                        // Step 1: Save User
                        Mono.from(userInfoRepository.save(mapToUserEntity(validReq)))
                                .switchIfEmpty(Mono.error(new IllegalStateException("Failed to save user credentials")))
                                .flatMap(savedUser ->
                                        // Step 2: Fetch next sequence number and build MemberEntity with non-null memberId
                                        memberRepository.getNextMemberSequence()
                                                .defaultIfEmpty(1L)
                                                .flatMap(nextSeq -> {
                                                    MemberEntity member = mapToMemberEntity(validReq);
                                                    member.setMemberId(String.format("%03d", nextSeq)); // Pre-set memberId ("001", "002")
                                                    return Mono.from(memberRepository.save(member));
                                                })
                                                .switchIfEmpty(Mono.error(new IllegalStateException("Failed to save organization details")))
                                                .flatMap(savedMember ->
                                                        // Step 3: Link User and Member
                                                        Mono.from(userMemberRepository.save(mapToUserMemberEntity(savedUser, savedMember)))
                                                                .switchIfEmpty(Mono.error(new IllegalStateException("Failed to link user to organization")))
                                                                .map(userMember -> mapToResponse(savedUser, savedMember))
                                                )
                                )
                )
                .onErrorResume(throwable -> Mono.just(
                        UserRegistrationUcResponse.error(
                                Objects.requireNonNullElse(throwable.getMessage(), "An unexpected error occurred during registration")
                        )
                ));
    }

    private UserInfoEntity mapToUserEntity(UserRegistrationUcRequest request) {
        UserInfoEntity user = new UserInfoEntity();
        user.setUserName(request.userName());
        user.setUserId(request.userId());
        user.setPassword(hashPassword(request.password()));
        user.setPhoneNumber(request.phoneNumber());
        user.setGmail(request.gmail());
        user.setEnable(true);
        user.setPermission("ADD, EDIT");
        user.setRole("ADMIN");
        user.setUpdatedBy("System");
        user.setCreatedBy("System");
        return user;
    }

    private MemberEntity mapToMemberEntity(UserRegistrationUcRequest request) {
        MemberEntity member = new MemberEntity();
        member.setOrganizationName(request.organizationName());
        member.setPanVatNumber(request.panVatNumber());
        member.setOrganizationType(request.organizationType());
        member.setBranch(request.branch());
        member.setOrganizationAddress(request.organizationAddress());
        member.setNotes(request.notes());
        member.setUpdatedBy("System");
        member.setCreatedBy("System");
        return member;
    }

    private Mono<MemberEntity> formatAndUpdateMemberId(MemberEntity member) {
        // Formats ID to zero-padded 3-digit string (e.g., ID 1 -> "001", ID 12 -> "012")
        String formattedMemberId = String.format("%03d", member.getId());
        member.setMemberId(formattedMemberId);
        return Mono.from(memberRepository.update(member));
    }

    private UserMemberEntity mapToUserMemberEntity(UserInfoEntity user, MemberEntity member) {
        UserMemberEntity userMember = new UserMemberEntity();
        userMember.setUser(user);
        userMember.setMember(member);
        userMember.setCreatedBy("System");
        return userMember;
    }

    private UserRegistrationUcResponse mapToResponse(UserInfoEntity user, MemberEntity member) {
        return UserRegistrationUcResponse.success(
                user.getId(),
                user.getGmail(),
                user.getUserName(),
                member.getOrganizationName(),
                member.getMemberId() // Returns formatted memberId ("001", "002", etc.)
        );
    }
}