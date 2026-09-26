package com.puff.tech.usermanagement.enums;

import lombok.Getter;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Getter
public enum Permission {
    //Dashboard Module Permissions
    DASHBOARD_CUSTOMER_VIEW(Module.DASHBOARD, "customer:view"),
    DASHBOARD_SUPPLIER_VIEW(Module.DASHBOARD, "supplier:view"),

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

    //Supplier Module Permissions
    SUPPLIER_CREATE(Module.SUPPLIER, "create"),
    SUPPLIER_UPDATE(Module.SUPPLIER, "update"),
    SUPPLIER_DELETE(Module.SUPPLIER, "delete"),
    SUPPLIER_FIND_ONE(Module.SUPPLIER, "single"),
    SUPPLIER_FIND_ALL(Module.SUPPLIER, "list"),

    //Own KhataBook Permissions
    OWN_KHATA_BOOK_ADD(Module.OWN_KHATA_BOOK, "add"),
    OWN_KHATA_BOOK_UPDATE(Module.OWN_KHATA_BOOK, "update"),
    OWN_KHATA_BOOK_VIEW(Module.OWN_KHATA_BOOK, "view"),

    //Member Permissions
    MEMBER_SELECTED(Module.MEMBER,"selected" ),

    //Organization Permissions
    ORGANIZATION_USER_VIEW(Module.ORGANIZATION,"view"),
    ORGANIZATION_USER_ADD(Module.ORGANIZATION, "add"),
    ORGANIZATION_USER_ACTIVE(Module.ORGANIZATION,"user:active"),
    ORGANIZATION_USER_ROLE_CHANGE(Module.ORGANIZATION, "user:module_change");

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
