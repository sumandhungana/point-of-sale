package com.puff.tech.covertor;

import com.puff.tech.entity.ServiceEntity;
import com.puff.tech.usecase.service.create.CreateServiceUseCaseRequest;
import com.puff.tech.usecase.service.get.GetServiceUseCaseResponse;
import com.puff.tech.usecase.service.update.UpdateServiceUseCaseRequest;

import java.util.Base64;

public class ServiceConvertor {
    private ServiceConvertor(){}

    public static ServiceEntity toEntity(CreateServiceUseCaseRequest request,
                                         Integer khataBookId){
        ServiceEntity serviceEntity= new ServiceEntity();
        serviceEntity.setKhataBookId(khataBookId);
        serviceEntity.setServiceName(request.serviceName());
        serviceEntity.setPrice(request.price());
        serviceEntity.setTaxIncluded(request.taxIncluded());
        serviceEntity.setTaxIncludedAmount(request.tax().add(request.price()));
        serviceEntity.setTax(request.tax());
        serviceEntity.setVat(request.vat());
        try{
            serviceEntity.setImagePath(getImageBase64String(request.image().getBytes()));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return serviceEntity;
    }

    private static String getImageBase64String(byte[] src){
        return Base64.getEncoder().encodeToString(src);
    }

    public static GetServiceUseCaseResponse toResponse(ServiceEntity serviceEntity){
        return new GetServiceUseCaseResponse(
                serviceEntity.getId(),
                serviceEntity.getServiceName(),
                serviceEntity.getPrice(),
                serviceEntity.isTaxIncluded(),
                serviceEntity.getTax(),
                serviceEntity.getVat(),
                serviceEntity.getImagePath(),
                serviceEntity.getCreatedAt(),
                serviceEntity.getUpdatedAt()
        );
    }

    public static ServiceEntity toEntityUpdate(UpdateServiceUseCaseRequest request,
                                               ServiceEntity serviceEntity){
        serviceEntity.setServiceName(request.serviceName());
        serviceEntity.setPrice(request.price());
        serviceEntity.setTaxIncluded(request.taxIncluded());
        serviceEntity.setTaxIncludedAmount(request.tax().add(request.price()));
        serviceEntity.setTax(request.tax());
        serviceEntity.setVat(request.vat());
        try{
            serviceEntity.setImagePath(getImageBase64String(request.image().getBytes()));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return serviceEntity;
    }
}
