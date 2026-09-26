package com.puff.tech.suppliermanagement.usecase.getone;

import com.puff.tech.core.usecases.MonoUC;
import com.puff.tech.core.usecases.UseCases;
import com.puff.tech.security.UseCaseContext;
import com.puff.tech.suppliermanagement.convertor.SupplierConvertor;
import com.puff.tech.suppliermanagement.repository.SupplierRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import com.puff.tech.suppliermanagement.usecase.get.GetSupplierUseCaseResponse;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class GetOneSupplierUseCase implements MonoUC<GetOneSupplierUseCaseRequest, GetSupplierUseCaseResponse> {

    private final SupplierRepository supplierRepository;


    @Inject
    public GetOneSupplierUseCase(SupplierRepository supplierRepository) {
        this.supplierRepository = supplierRepository;

    }

    @Override
    public Mono<GetSupplierUseCaseResponse> execute(GetOneSupplierUseCaseRequest request, UseCaseContext context) {
        return supplierRepository.findByIdAndMemberId(request.id(), context.securityContext().memberId())
                .map(SupplierConvertor::toResponse)
                .onErrorResume(err->Mono.error(new Throwable("Failed to load supplier data: " +err.getLocalizedMessage())));
    }

}
