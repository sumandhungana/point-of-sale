package com.puff.tech.usecase.supplier.getone;

import com.puff.tech.core.usecases.UseCase;
import com.puff.tech.covertor.SupplierConvertor;
import com.puff.tech.repository.SupplierRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import com.puff.tech.usecase.supplier.get.GetSupplierUseCaseResponse;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class GetOneSupplierUseCase implements UseCase<GetOneSupplierUseCaseRequest, GetSupplierUseCaseResponse> {

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
                        supplierRepository.findByIdAndKhataBookId(request.id(), khataBookId)
                                .map(SupplierConvertor::toResponse)
                                .onErrorResume(err->Mono.error(new RuntimeException("Unexpected happened" +err.getLocalizedMessage()))));
    }
}
