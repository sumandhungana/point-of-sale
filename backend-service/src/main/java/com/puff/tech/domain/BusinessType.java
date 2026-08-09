package com.puff.tech.domain;

public enum BusinessType {
    SOLE("SOLE", "sole"),
    PARTNERSHIP("PARTNERSHIP", "partnership"),
    CORPORATION("CORPORATION", "corporation"),
    LLC("LLC", "llc");

    private String code;
    private String value;

    BusinessType(String code, String value){
        this.code=code;
        this.value= value;
    }
}
