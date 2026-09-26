package com.puff.tech.suppliermanagement.usecase.create;

import com.puff.tech.core.usecases.MonoUC;
import com.puff.tech.core.usecases.UseCases;
import com.puff.tech.security.UseCaseContext;
import com.puff.tech.suppliermanagement.convertor.SupplierConvertor;
import com.puff.tech.suppliermanagement.repository.SupplierRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class CreateSupplierUseCase implements MonoUC<CreateSupplierUseCaseRequest,CreateSupplierUseCaseResponse> {

    private final SupplierRepository supplierRepository;


    @Inject
    public CreateSupplierUseCase(SupplierRepository supplierRepository) {
        this.supplierRepository = supplierRepository;

    }


    @Override
    public Mono<CreateSupplierUseCaseResponse> execute(CreateSupplierUseCaseRequest request, UseCaseContext context) {
        var supplier = SupplierConvertor.toEntity(request, context.securityContext());
        return supplierRepository.save(supplier)
                .map(saved->new CreateSupplierUseCaseResponse("Supplier created"))
                .onErrorResume(err->Mono.error(new RuntimeException("Unexpected happened: " +err.getLocalizedMessage())));

    }

}
