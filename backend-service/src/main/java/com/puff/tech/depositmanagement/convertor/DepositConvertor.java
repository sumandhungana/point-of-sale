package com.puff.tech.depositmanagement.convertor;

import com.puff.tech.depositmanagement.repository.Deposit;
import com.puff.tech.depositmanagement.usecase.add.AddDepositUCRequest;
import com.puff.tech.depositmanagement.usecase.edit.UpdateDepositUCRequest;
import com.puff.tech.depositmanagement.usecase.get.GetDepositUCResponse;
import com.puff.tech.onboarding.repository.MemberEntity;
import com.puff.tech.security.UserSecurityContext;

public class DepositConvertor {

    private DepositConvertor(){}

    public static Deposit toEntity(AddDepositUCRequest request, UserSecurityContext context){
        Deposit entity= new Deposit();
        if(context.memberId()!=null){
            MemberEntity memberEntity=new MemberEntity();
            memberEntity.setId(context.memberId());
            entity.setMember(memberEntity);
        }
        entity.setPaymentParty(request.paymentParty());
        entity.setPartyId(request.partyId());
        entity.setAmount(request.amount());
        entity.setRemarks(request.remarks());
        entity.setCreatedBy(context.subject());
        entity.setUpdatedBy(context.subject());
        return entity;
    }

    public static GetDepositUCResponse toResponse(Deposit entity){
        return GetDepositUCResponse.builder()
                .id(entity.getId())
                .member(entity.getMember())
                .paymentParty(entity.getPaymentParty())
                .partyId(entity.getPartyId())
                .amount(entity.getAmount())
                .remarks(entity.getRemarks())
                .createdBy(entity.getCreatedBy())
                .createdAt(entity.getCreatedAt())
                .updatedBy(entity.getUpdatedBy())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public static Deposit toUpdate(Deposit entity, UpdateDepositUCRequest request){
        entity.setAmount(request.amount());
        entity.setRemarks(request.remarks());
        return entity;
    }
}
