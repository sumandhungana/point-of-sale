
package com.puff.tech.onboarding.usecase.registration;

import com.puff.tech.core.usecases.MonoUC;
import com.puff.tech.core.usecases.UseCases;
import com.puff.tech.core.utils.JsonUtils;
import com.puff.tech.onboarding.repository.*;
import com.puff.tech.security.UseCaseContext;
import com.puff.tech.usermanagement.repository.UserPermissionEntity;
import com.puff.tech.usermanagement.repository.UserPermissionRepository;
import com.puff.tech.usermanagement.repository.UserRoleEntity;
import com.puff.tech.usermanagement.repository.UserRoleRepository;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import reactor.core.publisher.Mono;

import java.util.Objects;

import static com.puff.tech.core.utils.SecurityUtils.hashPassword;

@Singleton
public class UserRegistrationUseCase implements MonoUC<UserRegistrationUcRequest, UserRegistrationUcResponse> {

    private static final Logger LOG = LoggerFactory.getLogger(UserRegistrationUseCase.class);
    private final UserInfoRepository userInfoRepository;
    private final MemberRepository memberRepository;
    private final UserMemberRepository userMemberRepository;
    private final UserRoleRepository userRoleRepository;
    private static final String DEFAULT_ROLE_NAME = "ADMIN";

    public UserRegistrationUseCase(UserInfoRepository userInfoRepository,
                                   MemberRepository memberRepository,
                                   UserMemberRepository userMemberRepository,
                                   UserRoleRepository userRoleRepository) {
        this.userInfoRepository = userInfoRepository;
        this.memberRepository = memberRepository;
        this.userMemberRepository = userMemberRepository;
        this.userRoleRepository = userRoleRepository;
    }

    @Override
    public Mono<UserRegistrationUcResponse> execute(UserRegistrationUcRequest request, UseCaseContext context) {
        return Mono.justOrEmpty(request)
                .switchIfEmpty(Mono.error(new IllegalArgumentException("Request payload cannot be empty")))
                .filter(req -> Objects.nonNull(req.gmail()) && !req.gmail().isBlank())
                .switchIfEmpty(Mono.error(new IllegalArgumentException("Email/Gmail is required for registration")))
                .flatMap(validReq ->
                        // Step 0: Fetch ADMIN Role with joined Permissions
                        userRoleRepository.findByName(DEFAULT_ROLE_NAME)
                                .switchIfEmpty(Mono.error(new IllegalStateException("Default role '" + DEFAULT_ROLE_NAME + "' not found in database")))
                                .flatMap(adminRole ->
                                        // Step 1: Save User
                                        Mono.from(userInfoRepository.save(mapToUserEntity(validReq, adminRole)))
                                                .switchIfEmpty(Mono.error(new IllegalStateException("Failed to save user credentials")))
                                                .flatMap(savedUser ->
                                                        // Step 2: Fetch sequence and build Member Entity
                                                        memberRepository.getNextMemberSequence()
                                                                .defaultIfEmpty(1L)
                                                                .flatMap(nextSeq -> {
                                                                    MemberEntity member = mapToMemberEntity(validReq);
                                                                    member.setMemberId(String.format("%03d", nextSeq));
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
                )
                .doOnError(err -> LOG.error("User registration failed for email {}: ", request != null ? request.gmail() : "N/A", err))
                .onErrorResume(throwable -> {
                    String errorMsg = (throwable.getMessage() != null && !throwable.getMessage().isBlank())
                            ? throwable.getMessage()
                            : throwable.getClass().getSimpleName() + " occurred";
                    return Mono.just(UserRegistrationUcResponse.error(errorMsg));
                });
    }

    private UserInfoEntity mapToUserEntity(UserRegistrationUcRequest request, UserRoleEntity roleEntity) {
        UserInfoEntity user = new UserInfoEntity();
        user.setUserName(request.userName());
        user.setUserId(request.userId());
        user.setPassword(hashPassword(request.password()));
        user.setPhoneNumber(request.phoneNumber());
        user.setGmail(request.gmail());
        user.setEnable(true);
        // Safe extraction of permission ID to prevent NoSuchElementException
        if (roleEntity.getPermissions() != null && !roleEntity.getPermissions().isEmpty()) {
            String permissionIds = JsonUtils.toJsonString(
                    roleEntity.getPermissions()
                            .stream()
                            .map(UserPermissionEntity::getId)
                            .toList()
            );
            user.setPermission(permissionIds);
        } else {
            user.setPermission(null);
        }
        user.setRole(String.valueOf(roleEntity.getId()));
        user.setUpdatedBy("System");
        user.setCreatedBy("SELF_ONBOARDING");
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