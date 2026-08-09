package com.puff.tech.covertor;

import com.puff.tech.entity.SmsGatewayEntity;
import com.puff.tech.usecase.smsgateway.create.CreateSmsGatewayUseCaseRequest;
import com.puff.tech.usecase.smsgateway.get.GetSmsGatewayUseCaseResponse;
import com.puff.tech.usecase.smsgateway.update.UpdateSmsGatewayUseCaseRequest;

public class SmsGatewayConvertor {
    private SmsGatewayConvertor(){}

    public static SmsGatewayEntity toEntity(CreateSmsGatewayUseCaseRequest request,
                                            Integer khataBookId){
        SmsGatewayEntity smsGatewayEntity= new SmsGatewayEntity();
        smsGatewayEntity.setKhataBookId(khataBookId);
        smsGatewayEntity.setPartnerName(request.partnerName());
        smsGatewayEntity.setActive(request.active());
        smsGatewayEntity.setForm(request.form());
        smsGatewayEntity.setToken(request.token());
        smsGatewayEntity.setApiUrl(request.apiUrl());
        smsGatewayEntity.setTestSms(request.testSms());

        return smsGatewayEntity;
    }

    public static GetSmsGatewayUseCaseResponse toResponse(SmsGatewayEntity smsGatewayEntity){
        return new GetSmsGatewayUseCaseResponse(
                smsGatewayEntity.getId(),
                smsGatewayEntity.getPartnerName(),
                smsGatewayEntity.isActive(),
                smsGatewayEntity.getForm(),
                smsGatewayEntity.getToken(),
                smsGatewayEntity.getApiUrl(),
                smsGatewayEntity.getTestSms(),
                smsGatewayEntity.getCreatedAt(),
                smsGatewayEntity.getUpdatedAt()
        );
    }

    public static SmsGatewayEntity toEntityUpdate(UpdateSmsGatewayUseCaseRequest request,
                                                  SmsGatewayEntity smsGatewayEntity){
        smsGatewayEntity.setPartnerName(request.partnerName());
        smsGatewayEntity.setActive(request.active());
        smsGatewayEntity.setForm(request.form());
        smsGatewayEntity.setToken(request.token());
        smsGatewayEntity.setApiUrl(request.apiUrl());
        smsGatewayEntity.setTestSms(request.testSms());

        return smsGatewayEntity;
    }
}
