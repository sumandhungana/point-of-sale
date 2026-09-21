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


    public static UserRegistrationUcRequest toUcRequest(UserRegistrationReqPayload payload) {
        return new UserRegistrationUcRequest(
                payload.userName(),
                payload.phoneNumber(),
                payload.gmail(),
                payload.organizationName(),
                payload.panVatNumber(),
                payload.branch(),
                payload.organizationType(),
                payload.organizationAddress(),
                payload.notes(),
                payload.password(),
                payload.gmail()
        );
    }
}
