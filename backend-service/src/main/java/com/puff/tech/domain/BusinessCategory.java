package com.puff.tech.domain;

public enum BusinessCategory {
    RETAIL("RETAIL", "retail"),
    WHOLESALE("WHOLESALE", "wholesale"),
    MANUFACTURING("MANUFACTURING", "manufacturing"),
    SERVICE("SERVICE","service");

    private String code;
    private String value;

    BusinessCategory(String code, String value){
        this.code=code;
        this.value= value;
    }
}
