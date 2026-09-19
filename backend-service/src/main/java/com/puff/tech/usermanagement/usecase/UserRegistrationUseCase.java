
package com.puff.tech.usermanagement.usecase;

import com.puff.tech.core.usecases.UseCase;
import com.puff.tech.security.SecurityContextHolder;
import com.puff.tech.usermanagement.repository.UserEnrollmentRepository;
import com.puff.tech.usermanagement.repository.UserInfoEntity;
import com.puff.tech.usermanagement.repository.UserInfoRepository;
import com.puff.tech.usermanagement.repository.UserRegistrationEntity;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

import java.util.Objects;

@Singleton
public class UserRegistrationUseCase implements UseCase<UserRegistrationUcRequest, UserRegistrationUcResponse> {
    private final UserInfoRepository userInfoRepository;
    private final UserEnrollmentRepository userEnrollmentRepository;

    public UserRegistrationUseCase(UserInfoRepository userInfoRepository, UserEnrollmentRepository userEnrollmentRepository) {
        this.userInfoRepository = userInfoRepository;
        this.userEnrollmentRepository = userEnrollmentRepository;
    }

    @Override
    public Mono<UserRegistrationUcResponse> execute(UserRegistrationUcRequest request) {
        return Mono.justOrEmpty(request)
                // Reject null request
                .switchIfEmpty(Mono.error(new IllegalArgumentException("Request payload cannot be empty")))

                // Validate required fields
                .filter(req -> Objects.nonNull(req.gmail()) && !req.gmail().isBlank())
                .switchIfEmpty(Mono.error(new IllegalArgumentException("Email/Gmail is required for registration")))

                // Step 1: Save User Credentials First
                .flatMap(validReq -> Mono.from(userInfoRepository.save(mapToUserEntity(validReq)))
                        .switchIfEmpty(Mono.error(new IllegalStateException("Failed to save user credentials")))

                        // Step 2: Pass savedUser to UserRegistrationEntity and Save
                        .flatMap(savedUser -> Mono.from(userEnrollmentRepository.save(mapToRegistrationEntity(validReq, savedUser)))
                                .switchIfEmpty(Mono.error(new IllegalStateException("Failed to save customer details")))
                                .map(savedRegistration -> mapToResponse(savedUser, savedRegistration))
                        )
                )

                // Catch all errors and map to error response
                .onErrorResume(throwable -> Mono.just(
                        UserRegistrationUcResponse.error(
                                Objects.requireNonNullElse(throwable.getMessage(), "An unexpected error occurred during registration")
                        )
                ));
    }

    private UserInfoEntity mapToUserEntity(UserRegistrationUcRequest request) {
        UserInfoEntity user = new UserInfoEntity();
        user.setUsername(request.gmail());
        user.setPassword("request.password()"); // Apply password hashing here
        user.setEnable(true);
        user.setPermission("ADD, EDIT");
        user.setRole("ADMIN");
        return user;
    }

    private UserRegistrationEntity mapToRegistrationEntity(UserRegistrationUcRequest request, UserInfoEntity user) {
        UserRegistrationEntity registration = new UserRegistrationEntity();
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
        return registration;
    }

    private UserRegistrationUcResponse mapToResponse(UserInfoEntity user, UserRegistrationEntity registration) {
        return UserRegistrationUcResponse.success(
                user.getId(),
                registration.getGmail(),
                user.getUsername(),
                registration.getOrganizationName()
        );
    }

    public Mono<String> authenticationToken() {
        return SecurityContextHolder.getToken()
                .flatMap(token -> Mono.just("Processed with token: " + token))
                .switchIfEmpty(Mono.error(new IllegalStateException("Unauthenticated: No token provided")));
    }
}