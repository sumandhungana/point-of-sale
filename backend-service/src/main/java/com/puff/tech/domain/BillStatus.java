package com.puff.tech.domain;

public enum BillStatus {

    UNPAID("UNPAID", "unpaid"),
    PAID("PAID", "paid"),
    PENDING("PENDING","pending");

    private final String code;
    private final String value;

    BillStatus(String code, String value) {
        this.code = code;
        this.value = value;
    }
}
