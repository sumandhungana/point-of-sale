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

    SYSTEM_METRICS(Module.SYSTEM_METRICS, "view"),

    // User Module Permissions
    USER_CREATE(Module.USER, "create"),
    USER_UPDATE(Module.USER, "update"),
    USER_DELETE(Module.USER, "delete"),
    USER_FIND_ONE(Module.USER, "single"),
    USER_FIND_ALL(Module.USER, "list"),

    // User Module Permissions
    ROLE_PERMISSION_CREATE(Module.ROLE_PERMISSION_MANAGEMENT, "create"),
    ROLE_PERMISSION_UPDATE(Module.ROLE_PERMISSION_MANAGEMENT, "update"),
    ROLE_PERMISSION_DELETE(Module.ROLE_PERMISSION_MANAGEMENT, "delete"),
    ROLE_PERMISSION_FIND_ONE(Module.ROLE_PERMISSION_MANAGEMENT, "single"),
    ROLE_PERMISSION_FIND_ALL(Module.ROLE_PERMISSION_MANAGEMENT, "list"),

    //Staff Module Permissions
    STAFF_CREATE(Module.STAFF_MANAGEMENT, "create"),
    STAFF_UPDATE(Module.STAFF_MANAGEMENT, "update"),
    STAFF_DELETE(Module.STAFF_MANAGEMENT, "delete"),
    STAFF_FIND_ONE(Module.STAFF_MANAGEMENT, "single"),
    STAFF_FIND_ALL(Module.STAFF_MANAGEMENT, "list"),
    STAFF_PAYMENT(Module.STAFF_MANAGEMENT, "payment"),

    // Customer Module Permissions
    CUSTOMER_CREATE(Module.CUSTOMER, "create"),
    CUSTOMER_UPDATE(Module.CUSTOMER, "update"),
    CUSTOMER_DELETE(Module.CUSTOMER, "delete"),
    CUSTOMER_FIND_ONE(Module.CUSTOMER, "single"),
    CUSTOMER_FIND_ALL(Module.CUSTOMER, "list"),
    CUSTOMER_PAYMENT(Module.CUSTOMER, "payment"),

    //Supplier Module Permissions
    SUPPLIER_CREATE(Module.SUPPLIER, "create"),
    SUPPLIER_UPDATE(Module.SUPPLIER, "update"),
    SUPPLIER_DELETE(Module.SUPPLIER, "delete"),
    SUPPLIER_FIND_ONE(Module.SUPPLIER, "single"),
    SUPPLIER_FIND_ALL(Module.SUPPLIER, "list"),
    SUPPLIER_PAYMENT(Module.SUPPLIER, "payment"),

    //Own KhataBook Permissions
    OWN_KHATA_BOOK_ONBOARDING(Module.OWN_KHATA_BOOK, "onboarding"),
    OWN_KHATA_BOOK_UPDATE(Module.OWN_KHATA_BOOK, "update"),
    OWN_KHATA_BOOK_DELETE(Module.OWN_KHATA_BOOK, "delete"),
    OWN_KHATA_BOOK_VIEW(Module.OWN_KHATA_BOOK, "view"),
    OWN_KHATA_BOOK_SWITCH(Module.OWN_KHATA_BOOK, "switch"),
    OWN_KHATA_BOOK_ALL_MEMBER(Module.OWN_KHATA_BOOK, "all:member"),
    OWN_KHATA_BOOK_SELECTED(Module.OWN_KHATA_BOOK,"selected" ),

    //Organization Permissions
    ORGANIZATION_List(Module.ORGANIZATION,"list"),
    ORGANIZATION_SINGLE(Module.ORGANIZATION, "single"),
    ORGANIZATION_REGISTRATION(Module.ORGANIZATION, "registration"),
    ORGANIZATION_ACTIVE(Module.ORGANIZATION,"user:active"),
    ORGANIZATION_SELECTED(Module.ORGANIZATION,"selected" ),
    ORGANIZATION_ROLE_CHANGE(Module.ORGANIZATION, "user:module_change"),

    //Inventory Permissions
    INVENTORY_CATEGORY_ALL(Module.CATEGORY_MANAGEMENT, "all"),
    INVENTORY_CATEGORY_ADD(Module.CATEGORY_MANAGEMENT, "add")
    ;

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
