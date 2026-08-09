package com.puff.tech.usecase.supplier.get;

import com.puff.tech.covertor.SupplierConvertor;
import com.puff.tech.repository.SupplierRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Flux;

@Singleton
public class GetSupplierUseCase {

    private final SupplierRepository supplierRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public GetSupplierUseCase(SupplierRepository supplierRepository,
                              KhataBookImplementation khataBookImplementation) {
        this.supplierRepository = supplierRepository;
        this.khataBookImplementation = khataBookImplementation;
    }

    public Flux<GetSupplierUseCaseResponse> execute(){
        return khataBookImplementation.getCurrentKhataBookId()
                .flatMapMany(khataBookId->
                        supplierRepository.findAllByKhataBookId(khataBookId)
                                .map(SupplierConvertor::toResponse)
                                .onErrorResume(err->Flux.error(new RuntimeException("Unexpected happened" +err.getLocalizedMessage()))));
    }
}
