package com.puff.tech.covertor;

import com.puff.tech.entity.SupplierEntity;
import com.puff.tech.usecase.supplier.create.CreateSupplierUseCaseRequest;
import com.puff.tech.usecase.supplier.get.GetSupplierUseCaseResponse;
import com.puff.tech.usecase.supplier.update.UpdateSupplierUseCaseRequest;

import java.util.Base64;

public class SupplierConvertor {
    private SupplierConvertor(){}

    public static SupplierEntity toEntity(CreateSupplierUseCaseRequest request,
                                          Integer khataBookId){
        SupplierEntity supplierEntity= new SupplierEntity();
        supplierEntity.setKhataBookId(khataBookId);
        supplierEntity.setName(request.name());
        supplierEntity.setPhone(request.phone());
        supplierEntity.setEmail(request.email());
        supplierEntity.setAddress(request.address());
        supplierEntity.setCompany(request.company());
        supplierEntity.setPan(request.pan());
        try{
            supplierEntity.setProfileImage(getImageBase64String(request.profileImage().getBytes()));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return supplierEntity;
    }

    private static String getImageBase64String(byte[] src){
        return Base64.getEncoder().encodeToString(src);
    }

    public static GetSupplierUseCaseResponse toResponse(SupplierEntity supplierEntity){
        return new GetSupplierUseCaseResponse(
                supplierEntity.getId(),
                supplierEntity.getName(),
                supplierEntity.getPhone(),
                supplierEntity.getEmail(),
                supplierEntity.getAddress(),
                supplierEntity.getCompany(),
                supplierEntity.getPan(),
                supplierEntity.getContactPerson(),
                supplierEntity.getProfileImage(),
                supplierEntity.getCreatedAt(),
                supplierEntity.getUpdatedAt()
        );
    }

    public static SupplierEntity toEntityUpdate(UpdateSupplierUseCaseRequest request,
                                                SupplierEntity supplierEntity){

        supplierEntity.setName(request.name());
        supplierEntity.setPhone(request.phone());
        supplierEntity.setEmail(request.email());
        supplierEntity.setAddress(request.address());
        supplierEntity.setCompany(request.company());
        supplierEntity.setPan(request.pan());
        try{
            supplierEntity.setProfileImage(getImageBase64String(request.profileImage().getBytes()));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return supplierEntity;
    }
}
