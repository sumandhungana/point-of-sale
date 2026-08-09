package com.puff.tech.covertor;

import com.puff.tech.entity.CustomerEntity;
import com.puff.tech.usecase.customer.add.AddCustomerUseCaseRequest;
import com.puff.tech.usecase.customer.get.GetAllCustomerUseCaseResponse;
import com.puff.tech.usecase.customer.update.UpdateCustomerUseCaseRequest;




public class CustomerConvertor {
    private CustomerConvertor(){}


    public static CustomerEntity toEntity(AddCustomerUseCaseRequest request){
        CustomerEntity customerEntity= new CustomerEntity();
        customerEntity.setKhataBookId(request.khataBookId());
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

        return customerEntity;
    }

    public static GetAllCustomerUseCaseResponse toResponse(CustomerEntity customerEntity){
        return new GetAllCustomerUseCaseResponse(
                customerEntity.getKhataBookId(),
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

    public static CustomerEntity updateRequestToEntity(CustomerEntity customerEntity, UpdateCustomerUseCaseRequest request) {

        customerEntity.setKhataBookId(request.khataBookId());
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

}
