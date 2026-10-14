package com.puff.tech.domain;

public enum AttendanceStatus {
    ABSENT("ABSENT", "absent"),
    LEAVE("LEAVE", "leave"),
    PRESENT("PRESENT", "present"),
    HALF_DAY("HALF_DAY", "half_day");

    private final String code;
    private final String value;

    AttendanceStatus(String code, String value) {
        this.code = code;
        this.value = value;
    }

    public static AttendanceStatus fromString(String status) {
        if (status == null) return PRESENT;
        for (AttendanceStatus s : values()) {
            if (s.name().equalsIgnoreCase(status) || s.code.equalsIgnoreCase(status) || s.value.equalsIgnoreCase(status)) {
                return s;
            }
        }
        return PRESENT;
    }
}
