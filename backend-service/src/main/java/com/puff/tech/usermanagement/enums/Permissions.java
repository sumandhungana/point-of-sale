package com.puff.tech.usermanagement.enums;

import lombok.Getter;

@Getter
public enum Permissions {
    USER_CREATE("user", "user:create"),
    USER_UPDATE("user", "user:update"),
    CUSTOMER_CREATE("customer", "customer:create");

    private final String module;
    private final String value;

    Permissions(String module, String value) {
        this.module = module;
        this.value = value;
    }
}
