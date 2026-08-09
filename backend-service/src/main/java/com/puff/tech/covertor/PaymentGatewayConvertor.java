package com.puff.tech.covertor;

import com.puff.tech.entity.PaymentGatewayEntity;
import com.puff.tech.usecase.paymentgateway.create.CreatePaymentGatewayUseCaseRequest;
import com.puff.tech.usecase.paymentgateway.get.GetPaymentGatewayUseCaseResponse;
import com.puff.tech.usecase.paymentgateway.update.UpdatePaymentGatewayUseCaseRequest;

import java.util.Base64;

public class PaymentGatewayConvertor {
    private PaymentGatewayConvertor(){}

    public static PaymentGatewayEntity toEntity(CreatePaymentGatewayUseCaseRequest request,
                                                Integer khataBookId){
        PaymentGatewayEntity paymentGatewayEntity= new PaymentGatewayEntity();
        paymentGatewayEntity.setKhataBookId(khataBookId);
        paymentGatewayEntity.setName(request.name());
        paymentGatewayEntity.setDescription(request.description());
        paymentGatewayEntity.setActive(request.isActive());
        try{
            paymentGatewayEntity.setImagePath(getImageBase64Image(request.imagePath().getBytes()));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        paymentGatewayEntity.setVerificationUrl(request.verificationUrl());
        paymentGatewayEntity.setPublicKey(request.publicKey());
        paymentGatewayEntity.setSecretKey(request.secretKey());
        return paymentGatewayEntity;

    }

    private static String getImageBase64Image(byte[] src){
        return Base64.getEncoder().encodeToString(src);
    }

    public static GetPaymentGatewayUseCaseResponse toResponse(PaymentGatewayEntity paymentGatewayEntity){
        return new GetPaymentGatewayUseCaseResponse(
                paymentGatewayEntity.getId(),
                paymentGatewayEntity.getName(),
                paymentGatewayEntity.getPaymentMode(),
                paymentGatewayEntity.getDescription(),
                paymentGatewayEntity.isActive(),
                paymentGatewayEntity.getImagePath(),
                paymentGatewayEntity.getVerificationUrl(),
                paymentGatewayEntity.getPublicKey(),
                paymentGatewayEntity.getSecretKey(),
                paymentGatewayEntity.getCreatedAt(),
                paymentGatewayEntity.getUpdatedAt()
        );
    }

    public static PaymentGatewayEntity toEntityUpdate(UpdatePaymentGatewayUseCaseRequest request,
                                                      PaymentGatewayEntity paymentGatewayEntity             ){
        paymentGatewayEntity.setName(request.name());
        paymentGatewayEntity.setDescription(request.description());
        paymentGatewayEntity.setActive(request.isActive());
        try{
            paymentGatewayEntity.setImagePath(getImageBase64Image(request.imagePath().getBytes()));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        paymentGatewayEntity.setVerificationUrl(request.verificationUrl());
        paymentGatewayEntity.setPublicKey(request.publicKey());
        paymentGatewayEntity.setSecretKey(request.secretKey());
        return paymentGatewayEntity;

    }

}
