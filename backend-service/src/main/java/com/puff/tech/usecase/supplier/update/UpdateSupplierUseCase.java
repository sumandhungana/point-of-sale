package com.puff.tech.usecase.supplier.update;

import com.puff.tech.core.usecases.UseCase;
import com.puff.tech.covertor.SupplierConvertor;
import com.puff.tech.repository.SupplierRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class UpdateSupplierUseCase implements UseCase<UpdateSupplierUseCaseRequest,UpdateSupplierUseCaseResponse> {
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
                        supplierRepository.findByIdAndKhataBookId(request.id(), khataBookId)
                                .switchIfEmpty(Mono.error(new RuntimeException("Supplier not found")))
                                .flatMap(supplierEntity -> {
                                    var updated= SupplierConvertor.toEntityUpdate(request,supplierEntity);
                                    return supplierRepository.update(updated)
                                            .map(saved->new UpdateSupplierUseCaseResponse("Supplier updated"))
                                            .onErrorResume(err->Mono.error(new RuntimeException("Unexpected happened" +err.getLocalizedMessage())));
                                }));
    }
}
