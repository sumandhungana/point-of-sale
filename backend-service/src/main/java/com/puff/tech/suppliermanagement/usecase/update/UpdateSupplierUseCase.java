package com.puff.tech.suppliermanagement.usecase.update;

import com.puff.tech.core.usecases.UseCases;
import com.puff.tech.suppliermanagement.convertor.SupplierConvertor;
import com.puff.tech.suppliermanagement.repository.SupplierRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class UpdateSupplierUseCase implements UseCases<UpdateSupplierUseCaseRequest,UpdateSupplierUseCaseResponse> {
    private final SupplierRepository supplierRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public UpdateSupplierUseCase(SupplierRepository supplierRepository,
                                 KhataBookImplementation khataBookImplementation) {
        this.supplierRepository = supplierRepository;
        this.khataBookImplementation = khataBookImplementation;
    }


    @Override
    public Mono<UpdateSupplierUseCaseResponse> execute(UpdateSupplierUseCaseRequest request) {
        return khataBookImplementation.getCurrentKhataBookId()
                .flatMap(khataBookId->
                        supplierRepository.findByIdAndMemberId(request.id(), khataBookId)
                                .switchIfEmpty(Mono.error(new RuntimeException("Supplier not found")))
                                .flatMap(supplierEntity -> {
                                    var updated= SupplierConvertor.toEntityUpdate(request,supplierEntity);
                                    return supplierRepository.update(updated)
                                            .map(saved->new UpdateSupplierUseCaseResponse("Supplier updated"))
                                            .onErrorResume(err->Mono.error(new RuntimeException("Unexpected happened" +err.getLocalizedMessage())));
                                }));
    }
}
