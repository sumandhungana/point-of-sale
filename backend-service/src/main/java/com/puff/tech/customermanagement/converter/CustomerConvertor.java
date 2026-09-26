package com.puff.tech.customermanagement.converter;

import com.puff.tech.customermanagement.repository.CustomerEntity;
import com.puff.tech.customermanagement.repository.OrganizationCustomerEntity;
import com.puff.tech.customermanagement.usecase.add.AddCustomerUseCaseRequest;
import com.puff.tech.customermanagement.usecase.get.GetAllCustomerUseCaseResponse;
import com.puff.tech.customermanagement.usecase.update.UpdateCustomerUseCaseRequest;
import com.puff.tech.onboarding.repository.MemberEntity;
import com.puff.tech.security.UserSecurityContext;

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
        customerEntity.setPhone(request.phone());
        customerEntity.setEmail(request.email());
        customerEntity.setAddress(request.address());
        customerEntity.setCompany(request.company());
        customerEntity.setPan(request.pan());
        customerEntity.setContactPerson(request.contactPerson());
        customerEntity.setSupplier(request.isSupplier());
        customerEntity.setBankAccount(request.bankAccount());
        customerEntity.setCashBalance(request.cashBalance());
        customerEntity.setProfileImage(request.profileImage());
        customerEntity.setCustomerSmsSetting(request.customerSmsSetting());
        customerEntity.setSmsLanguage(request.smsLanguage());
        customerEntity.setTransactionHistoryCheck(request.transactionHistoryCheck());
        customerEntity.setCreatedBy("SYSTEM");
        customerEntity.setUpdatedBy("SYSTEM");

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
                customerEntity.getProfileImage()

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
