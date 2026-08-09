package com.puff.tech.covertor;

import com.puff.tech.entity.PaymentEntity;
import com.puff.tech.usecase.payment.create.CreatePaymentUseCaseRequest;
import com.puff.tech.usecase.payment.get.GetPaymentUseCaseResponse;
import com.puff.tech.usecase.payment.update.UpdatePaymentUseCaseRequest;

public class PaymentConvertor {
    private PaymentConvertor(){}

    public static PaymentEntity toEntity(CreatePaymentUseCaseRequest request,
                                         Integer khataBookId){
        PaymentEntity paymentEntity= new PaymentEntity();
        paymentEntity.setKhataBookId(khataBookId);
        paymentEntity.setAmount(request.amount());
        paymentEntity.setNotes(request.notes());
        paymentEntity.setPaymentDate(request.paymentDate());
        paymentEntity.setPaymentMode(request.paymentMode());
        return paymentEntity;
    }

    public static GetPaymentUseCaseResponse toResponse(PaymentEntity paymentEntity){
        return new GetPaymentUseCaseResponse(
                paymentEntity.getId(),
                paymentEntity.getAmount(),
                paymentEntity.getNotes(),
                paymentEntity.getPaymentDate(),
                paymentEntity.getPaymentMode(),
                paymentEntity.getCreatedAt()
        );
    }
    public static PaymentEntity toEntityUpdate(UpdatePaymentUseCaseRequest request,
                                               PaymentEntity paymentEntity){
        paymentEntity.setAmount(request.amount());
        paymentEntity.setNotes(request.notes());
        paymentEntity.setPaymentDate(request.paymentDate());
        paymentEntity.setPaymentMode(request.paymentMode());
        return paymentEntity;
    }
}
