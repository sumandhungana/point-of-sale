package com.puff.tech.usermanagement.enums;

import lombok.Getter;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Getter
public enum Permission {
    // User Module Permissions
    USER_CREATE(Module.USER, "create"),
    USER_UPDATE(Module.USER, "update"),
    USER_DELETE(Module.USER, "delete"),
    USER_FIND_ONE(Module.USER, "single"),
    USER_FIND_ALL(Module.USER, "list"),

    // Customer Module Permissions
    CUSTOMER_CREATE(Module.CUSTOMER, "create"),
    CUSTOMER_UPDATE(Module.CUSTOMER, "update"),
    CUSTOMER_DELETE(Module.CUSTOMER, "delete"),
    CUSTOMER_FIND_ONE(Module.CUSTOMER, "single"),
    CUSTOMER_FIND_ALL(Module.CUSTOMER, "list"),

    MEMBER_SELECTED(Module.MEMBER,"selected" );

    private final Module module;
    private final String action;
    private final String value; // e.g. "user:create"

    Permission(Module module, String action) {
        this.module = module;
        this.action = action;
        this.value = module.getCode() + ":" + action;
    }

    /**
     * Helper method to list all permissions associated with a given module.
     */
    public static List<Permission> getByModule(Module module) {
        return Arrays.stream(values())
                .filter(p -> p.getModule() == module)
                .collect(Collectors.toList());
    }
}
