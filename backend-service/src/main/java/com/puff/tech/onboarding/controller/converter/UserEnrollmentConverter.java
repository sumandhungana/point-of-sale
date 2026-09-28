package com.puff.tech.onboarding.controller.converter;

import com.puff.tech.onboarding.controller.payload.UserRegistrationReqPayload;
import com.puff.tech.onboarding.usecase.registration.UserRegistrationUcRequest;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.atomic.AtomicInteger;

public class UserEnrollmentConverter {
    private UserEnrollmentConverter(){}

    private static final AtomicInteger counter = new AtomicInteger(0);

    private static final DateTimeFormatter FORMATTER =
            DateTimeFormatter.ofPattern("yyyyMMdd-HHmmssSSS");

    public static String generateUserId() {
        int sequence = counter.getAndUpdate(i -> (i + 1) % 26);

        char prefix = (char) ('A' + sequence);

        String timestamp = LocalDateTime.now().format(FORMATTER);

        return prefix + "-" + timestamp;
    }


    public static UserRegistrationUcRequest toUcRequest(UserRegistrationReqPayload payload, boolean isExternalOnboarding) {
        return UserRegistrationUcRequest.builder()
                .userName( payload.userName())
                .phoneNumber(payload.phoneNumber())
                .gmail(payload.gmail())
                .organizationName(payload.organizationName())
                .panVatNumber(payload.panVatNumber())
                .branch(payload.branch())
                .organizationType(payload.organizationType())
                .organizationAddress(payload.organizationAddress())
                .notes(payload.notes())
                .password(payload.password())
                .organizationEmail(payload.organizationEmail())
                .organizationContactNumber(payload.organizationContactNumber())
                .isExternalOnboarding(isExternalOnboarding)
                .role(payload.role())
                .userId(payload.gmail())
                .build();
    }
}
