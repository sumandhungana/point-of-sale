package com.puff.tech.payment;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = PaymentPartyValidator.class)
@Documented
public @interface ValidPaymentParty {
    String message() default "Invalid relationship entity for the selected PaymentParty";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}