package com.puff.tech.usermanagement.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum Module {
    USER("user", "User Management"),
    CUSTOMER("customer", "Customer Management"),
    MEMBER("member", "Member Management");

    private final String code;
    private final String displayName;
}
