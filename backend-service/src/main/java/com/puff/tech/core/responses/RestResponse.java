package com.puff.tech.core.responses;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record RestResponse<T>(
        Integer code,
        String message,

        @JsonInclude(JsonInclude.Include.NON_NULL)
        T data
) {

    public static <T> RestResponse<T> success(T data){
        return new RestResponse<>(0,"SUCCESS",data);
    }
    public static <T> RestResponse<T> error(String message){
        return new RestResponse<>(-1,message,null);
    }
    public static <T> RestResponse<T> success(){
        return new RestResponse<>(1,"SUCCESS",null);
    }
}
