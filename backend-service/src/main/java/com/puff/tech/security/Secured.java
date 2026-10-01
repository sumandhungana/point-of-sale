package com.puff.tech.security;

import com.puff.tech.usermanagement.enums.Permission;
import io.micronaut.aop.Around;
import io.micronaut.context.annotation.Type;

import java.lang.annotation.*;

@Documented
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.METHOD, ElementType.TYPE})
@Around
@Type(SecurityInterceptor.class)
public @interface Secured {
    String[] roles() default {};
    Permission[] permissions() default {};
}
