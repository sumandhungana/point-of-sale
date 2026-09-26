package com.puff.tech.suppliermanagement.usecase.delete;

import com.puff.tech.core.usecases.MonoUC;
import com.puff.tech.core.usecases.UseCases;
import com.puff.tech.security.UseCaseContext;
import com.puff.tech.suppliermanagement.repository.SupplierRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class DeleteSupplierUseCase implements MonoUC<DeleteSupplierUseCaseRequest,DeleteSupplierUseCaseResponse> {

    private final SupplierRepository supplierRepository;

    @Inject
    public DeleteSupplierUseCase(SupplierRepository supplierRepository) {
        this.supplierRepository = supplierRepository;
    }

    @Override
    public Mono<DeleteSupplierUseCaseResponse> execute(DeleteSupplierUseCaseRequest request, UseCaseContext context) {
        return supplierRepository.findByIdAndMemberId(request.id(), context.securityContext().memberId())
                .switchIfEmpty(Mono.error(new Throwable("Supplier not found")))
                .flatMap(supplier->
                        supplierRepository.deleteById(request.id())
                                .then(Mono.just(new DeleteSupplierUseCaseResponse("Supplier deleted successfully")))
                                .onErrorResume(err->Mono.error(new Throwable("Failed to delete suppplier" +err.getLocalizedMessage())))
                );

    }


}
