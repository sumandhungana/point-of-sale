package com.puff.tech.suppliermanagement.usecase.update;

import com.puff.tech.core.usecases.MonoUC;
import com.puff.tech.security.UseCaseContext;
import com.puff.tech.suppliermanagement.convertor.SupplierConvertor;
import com.puff.tech.suppliermanagement.repository.SupplierRepository;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class UpdateSupplierUseCase implements MonoUC<UpdateSupplierUseCaseRequest,UpdateSupplierUseCaseResponse> {
    private final SupplierRepository supplierRepository;

    @Inject
    public UpdateSupplierUseCase(SupplierRepository supplierRepository) {
        this.supplierRepository = supplierRepository;

    }

    @Override
    public Mono<UpdateSupplierUseCaseResponse> execute(UpdateSupplierUseCaseRequest request, UseCaseContext context) {
        return supplierRepository.findByIdAndMemberId(request.id(), context.securityContext().memberId())
                .switchIfEmpty(Mono.error(new Throwable("Supplier not found")))
                .flatMap(supplier->{
                    var newSupplier= SupplierConvertor.toEntityUpdate(request,supplier);
                    newSupplier.setUpdatedBy("SYSTEM");
                    return supplierRepository.update(newSupplier)
                            .map(updatedSupplier->UpdateSupplierUseCaseResponse.builder()
                                            .message("Supplier updated")
                                    .build())
                            .onErrorResume(err->Mono.error(new Throwable("Failed to update supplier" +err.getLocalizedMessage())));
                });
    }


}
