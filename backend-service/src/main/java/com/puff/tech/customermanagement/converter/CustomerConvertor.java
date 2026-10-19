package com.puff.tech.customermanagement.converter;

import com.puff.tech.core.utils.HelperUtils;
import com.puff.tech.customermanagement.repository.OrganizationCustomerEntity;
import com.puff.tech.customermanagement.usecase.add.AddCustomerUseCaseRequest;
import com.puff.tech.customermanagement.usecase.get.GetAllCustomerUseCaseResponse;
import com.puff.tech.customermanagement.usecase.update.UpdateCustomerUseCaseRequest;
import com.puff.tech.onboarding.repository.MemberEntity;
import com.puff.tech.security.UserSecurityContext;

import java.math.BigDecimal;
import java.util.Base64;


public class CustomerConvertor {
    private CustomerConvertor(){}


    public static OrganizationCustomerEntity toEntity(AddCustomerUseCaseRequest request, UserSecurityContext context){
        OrganizationCustomerEntity customerEntity= new OrganizationCustomerEntity();
        if(context.memberId() != null) {
            MemberEntity memberEntity = new MemberEntity();
            memberEntity.setId(context.memberId());
            customerEntity.setMember(memberEntity);
        }
        customerEntity.setName(request.name());
        customerEntity.setPhone(HelperUtils.isBlankOrNull(request.phone()) ? "" : request.phone());
        customerEntity.setEmail(HelperUtils.isBlankOrNull(request.email()) ? "" : request.email());
        customerEntity.setAddress(HelperUtils.isBlankOrNull(request.address()) ? "" : request.address());
        customerEntity.setCompany(HelperUtils.isBlankOrNull(request.company()) ? "" : request.company());
        customerEntity.setPan(HelperUtils.isBlankOrNull(request.pan()) ? "" : request.pan());
        customerEntity.setContactPerson(HelperUtils.isBlankOrNull(request.contactPerson()) ? "" : request.contactPerson());
        customerEntity.setSupplier(request.isSupplier());
        customerEntity.setBankAccount(HelperUtils.isBlankOrNull(request.bankAccount()) ? "" :request.bankAccount());
        customerEntity.setCashBalance(request.cashBalance()== null ? BigDecimal.ZERO : request.cashBalance());
        customerEntity.setProfileImage(HelperUtils.isBlankOrNull(request.profileImage()) ? "" : request.profileImage());
        customerEntity.setCustomerSmsSetting(request.customerSmsSetting());
        customerEntity.setSmsLanguage(request.smsLanguage());
        customerEntity.setTransactionHistoryCheck(request.transactionHistoryCheck());
        customerEntity.setCreatedBy(context.subject());
        customerEntity.setUpdatedBy(context.subject());

        return customerEntity;
    }

    public static GetAllCustomerUseCaseResponse toResponse(OrganizationCustomerEntity customerEntity){
        return new GetAllCustomerUseCaseResponse(
                customerEntity.getId(),
                customerEntity.getName(),
                customerEntity.getPhone(),
                customerEntity.getEmail(),
                customerEntity.getAddress(),
                customerEntity.getCompany(),
                customerEntity.getPan(),
                customerEntity.getContactPerson(),
                customerEntity.getBankAccount(),
                customerEntity.getCashBalance(),
                customerEntity.getProfileImage(),
                customerEntity.getCreatedBy(),
                customerEntity.getCreatedAt(),
                customerEntity.getUpdatedBy(),
                customerEntity.getUpdatedAt()

        );
    }

    public static OrganizationCustomerEntity updateRequestToEntity(OrganizationCustomerEntity customerEntity, UpdateCustomerUseCaseRequest request) {


       customerEntity.setName(request.name());
       customerEntity.setPhone(request.phone());
       customerEntity.setEmail(request.email());
       customerEntity.setAddress(request.address());
       customerEntity.setCompany(request.company());
       customerEntity.setPan(request.pan());
       customerEntity.setContactPerson(request.contactPerson());
       customerEntity.setBankAccount(request.bankAccount());
       customerEntity.setCashBalance(request.cashBalance());
       customerEntity.setProfileImage(request.profileImage());


        return customerEntity;

    }

    private static String getImageBase64String(byte[] src){
        return Base64.getEncoder().encodeToString(src);
    }


}
