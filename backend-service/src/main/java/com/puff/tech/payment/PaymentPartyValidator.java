package com.puff.tech.payment;

import com.puff.tech.payment.repository.PaymentEntity;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class PaymentPartyValidator implements ConstraintValidator<ValidPaymentParty, PaymentEntity> {

    @Override
    public boolean isValid(PaymentEntity entity, ConstraintValidatorContext context) {
        if (entity == null || entity.getPaymentParty() == null) {
            return true;
        }

        context.disableDefaultConstraintViolation();

        return switch (entity.getPaymentParty()) {
            case CUSTOMER -> {
                if (entity.getCustomer() == null) {
                    context.buildConstraintViolationWithTemplate("customer must not be null when paymentParty is CUSTOMER")
                            .addPropertyNode("customer")
                            .addConstraintViolation();
                    yield false;
                }
                yield true;
            }
            case SUPPLIER -> {
                if (entity.getSupplier() == null) {
                    context.buildConstraintViolationWithTemplate("supplier must not be null when paymentParty is SUPPLIER")
                            .addPropertyNode("supplier")
                            .addConstraintViolation();
                    yield false;
                }
                yield true;
            }
            case STAFF -> {
                if (entity.getStaff() == null) {
                    context.buildConstraintViolationWithTemplate("staff must not be null when paymentParty is STAFF")
                            .addPropertyNode("staff")
                            .addConstraintViolation();
                    yield false;
                }
                yield true;
            }
            case AUDIT -> true;
        };
    }
}