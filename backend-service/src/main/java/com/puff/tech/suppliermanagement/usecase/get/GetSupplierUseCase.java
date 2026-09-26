package com.puff.tech.suppliermanagement.usecase.get;

import com.puff.tech.core.usecases.FluxUC;
import com.puff.tech.security.UseCaseContext;
import com.puff.tech.suppliermanagement.convertor.SupplierConvertor;
import com.puff.tech.suppliermanagement.repository.SupplierRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Flux;

@Singleton
public class GetSupplierUseCase implements FluxUC<GetSuppliersUseCaseRequest, GetSupplierUseCaseResponse> {

    private final SupplierRepository supplierRepository;


    @Inject
    public GetSupplierUseCase(SupplierRepository supplierRepository){
        this.supplierRepository = supplierRepository;

    }

    @Override
    public Flux<GetSupplierUseCaseResponse> execute(GetSuppliersUseCaseRequest request, UseCaseContext context) {
        return supplierRepository.findByMemberIdOrderByCreatedAtDesc(context.securityContext().memberId())
                .map(SupplierConvertor::toResponse)
                .onErrorResume(err-> Flux.error(new Throwable("Failed to fetch supplier" +err.getLocalizedMessage())));

    }

}
