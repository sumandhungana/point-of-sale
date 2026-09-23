package com.puff.tech.suppliermanagement.usecase.getone;

import com.puff.tech.core.usecases.UseCases;
import com.puff.tech.suppliermanagement.convertor.SupplierConvertor;
import com.puff.tech.suppliermanagement.repository.SupplierRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import com.puff.tech.suppliermanagement.usecase.get.GetSupplierUseCaseResponse;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class GetOneSupplierUseCase implements UseCases<GetOneSupplierUseCaseRequest, GetSupplierUseCaseResponse> {

    private final SupplierRepository supplierRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public GetOneSupplierUseCase(SupplierRepository supplierRepository,
                                 KhataBookImplementation khataBookImplementation) {
        this.supplierRepository = supplierRepository;
        this.khataBookImplementation = khataBookImplementation;
    }


    @Override
    public Mono<GetSupplierUseCaseResponse> execute(GetOneSupplierUseCaseRequest request) {
        return khataBookImplementation.getCurrentKhataBookId()
                .flatMap(khataBookId->
                        supplierRepository.findByIdAndMemberId(request.id(), khataBookId)
                                .map(SupplierConvertor::toResponse)
                                .onErrorResume(err->Mono.error(new RuntimeException("Unexpected happened" +err.getLocalizedMessage()))));
    }
}
