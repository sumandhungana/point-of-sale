
package com.puff.tech.usermanagement.usecase.registration;

import com.puff.tech.core.usecases.UseCases;
import com.puff.tech.usermanagement.repository.UserEnrollmentRepository;
import com.puff.tech.usermanagement.repository.UserInfoEntity;
import com.puff.tech.usermanagement.repository.UserInfoRepository;
import com.puff.tech.usermanagement.repository.UserMemberEntity;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

import java.util.Objects;

import static com.puff.tech.core.utils.SecurityUtils.hashPassword;

@Singleton
public class UserRegistrationUseCase implements UseCases<UserRegistrationUcRequest, UserRegistrationUcResponse> {
    private final UserInfoRepository userInfoRepository;
    private final UserEnrollmentRepository userEnrollmentRepository;

    public UserRegistrationUseCase(UserInfoRepository userInfoRepository, UserEnrollmentRepository userEnrollmentRepository) {
        this.userInfoRepository = userInfoRepository;
        this.userEnrollmentRepository = userEnrollmentRepository;
    }

    @Override
    public Mono<UserRegistrationUcResponse> execute(UserRegistrationUcRequest request) {
        return Mono.justOrEmpty(request)
                .switchIfEmpty(Mono.error(new IllegalArgumentException("Request payload cannot be empty")))
                .filter(req -> Objects.nonNull(req.gmail()) && !req.gmail().isBlank())
                .switchIfEmpty(Mono.error(new IllegalArgumentException("Email/Gmail is required for registration")))
                .flatMap(validReq -> Mono.from(userInfoRepository.save(mapToUserEntity(validReq)))
                        .switchIfEmpty(Mono.error(new IllegalStateException("Failed to save user credentials")))
                        .flatMap(savedUser -> Mono.from(userEnrollmentRepository.save(mapToRegistrationEntity(validReq, savedUser)))
                                .switchIfEmpty(Mono.error(new IllegalStateException("Failed to save customer details")))
                                .map(savedRegistration -> mapToResponse(savedUser, savedRegistration))))
                .onErrorResume(throwable -> Mono.just(
                        UserRegistrationUcResponse.error(
                                Objects.requireNonNullElse(throwable.getMessage(), "An unexpected error occurred during registration")
                        )
                ));
    }

    private UserInfoEntity mapToUserEntity(UserRegistrationUcRequest request) {
        UserInfoEntity user = new UserInfoEntity();
        user.setUsername(request.gmail());
        user.setPassword(hashPassword(request.password())); // Apply password hashing here
        user.setEnable(true);
        user.setUserId(request.userId());
        user.setPermission("ADD, EDIT");
        user.setRole("ADMIN");
        user.setUpdatedBy("System");
        user.setCreatedBy("System");
        return user;
    }

    private UserMemberEntity mapToRegistrationEntity(UserRegistrationUcRequest request, UserInfoEntity user) {
        UserMemberEntity registration = new UserMemberEntity();
        registration.setUser(user); // Connect saved UserInfoEntity (Populates user_id)
        registration.setUserName(request.userName());
        registration.setPhoneNumber(request.phoneNumber());
        registration.setGmail(request.gmail());
        registration.setOrganizationName(request.organizationName());
        registration.setBranch(request.branch());
        registration.setPanVatNumber(request.panVatNumber());
        registration.setOrganizationType(request.organizationType());
        registration.setOrganizationAddress(request.organizationAddress());
        registration.setNotes(request.notes());
        registration.setUpdatedBy("System");
        registration.setCreatedBy("System");
        return registration;
    }

    private UserRegistrationUcResponse mapToResponse(UserInfoEntity user, UserMemberEntity registration) {
        return UserRegistrationUcResponse.success(
                user.getId(),
                registration.getGmail(),
                user.getUsername(),
                registration.getOrganizationName()
        );
    }
}