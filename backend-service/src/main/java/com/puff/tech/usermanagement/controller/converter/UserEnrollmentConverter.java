package com.puff.tech.usermanagement.controller.converter;

import com.puff.tech.usermanagement.controller.payload.UserRegistrationReqPayload;
import com.puff.tech.usermanagement.usecase.UserRegistrationUcRequest;

public class UserEnrollmentConverter {
    private UserEnrollmentConverter(){}

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
                "testPassword",
                "testUserId"
        );
    }
}
