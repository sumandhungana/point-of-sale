package com.puff.tech.usecase.supplier.delete;

import com.puff.tech.core.usecases.UseCases;
import com.puff.tech.repository.SupplierRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class DeleteSupplierUseCase implements UseCases<DeleteSupplierUseCaseRequest,DeleteSupplierUseCaseResponse> {

    private final SupplierRepository supplierRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public DeleteSupplierUseCase(SupplierRepository supplierRepository,
                                 KhataBookImplementation khataBookImplementation) {
        this.supplierRepository = supplierRepository;
        this.khataBookImplementation = khataBookImplementation;
    }


    @Override
    public Mono<DeleteSupplierUseCaseResponse> execute(DeleteSupplierUseCaseRequest request) {
        return khataBookImplementation.getCurrentKhataBookId()
                .flatMap(khataBookId->
                        supplierRepository.findByIdAndKhataBookId(request.id(), khataBookId)
                                .switchIfEmpty(Mono.error(new RuntimeException("Supplier not found")))
                                .flatMap(supplierEntity ->
                                        supplierRepository.deleteById(request.id())
                                                .then(Mono.just(new DeleteSupplierUseCaseResponse("Supplier deleted")))));
    }
}
