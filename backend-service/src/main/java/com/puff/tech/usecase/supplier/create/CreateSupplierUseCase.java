package com.puff.tech.usecase.supplier.create;

import com.puff.tech.core.usecases.UseCase;
import com.puff.tech.covertor.SupplierConvertor;
import com.puff.tech.repository.SupplierRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class CreateSupplierUseCase implements UseCase<CreateSupplierUseCaseRequest,CreateSupplierUseCaseResponse> {

    private final SupplierRepository supplierRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public CreateSupplierUseCase(SupplierRepository supplierRepository,
                                 KhataBookImplementation khataBookImplementation) {
        this.supplierRepository = supplierRepository;
        this.khataBookImplementation = khataBookImplementation;
    }


    @Override
    public Mono<CreateSupplierUseCaseResponse> execute(CreateSupplierUseCaseRequest request) {
        return khataBookImplementation.getCurrentKhataBookId()
                .flatMap(khataBookId->{
                    var supplier = SupplierConvertor.toEntity(request,khataBookId);
                    return supplierRepository.save(supplier)
                            .map(saved->new CreateSupplierUseCaseResponse("Supplier created"))
                            .onErrorResume(err->Mono.error(new RuntimeException("Unexpected happened" +err.getLocalizedMessage())));
                });
    }
}
