package com.puff.tech.usermanagement.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum Module {
    DASHBOARD("dashboard", "Dashboard Management"),
    USER("user", "User Management"),
    CUSTOMER("customer", "Customer Management"),
    SUPPLIER("supplier", "Supplier Management"),
    RENTAL("rental","Rental Management"),
    OWN_KHATA_BOOK("own_khataBook","KhataBook Management"),
    MEMBER("member", "Member Management"),
    ORGANIZATION("organization", "Organization Management");

    private final String code;
    private final String displayName;
}
