package com.puff.tech.domain;

public enum AttendanceStatus {
    ABSENT("ABSENT", "absent"),
    LEAVE("LEAVE", "leave"),
    PRESENT("PRESENT", "present");

    private final String code;
    private final String value;

    AttendanceStatus(String code, String value) {
        this.code = code;
        this.value = value;
    }
}
