package com.puff.tech.customermanagement.usecase.get;

import com.puff.tech.core.usecases.FluxUC;
import com.puff.tech.customermanagement.converter.CustomerConvertor;
import com.puff.tech.customermanagement.repository.CustomerRepository;
import com.puff.tech.security.UseCaseContext;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Flux;

@Singleton
public class GetSuppliersUseCase implements FluxUC<GetSupplierUCRequest, GetAllCustomerUseCaseResponse> {

    private final CustomerRepository customerRepository;

    @Inject
    public GetSuppliersUseCase(CustomerRepository customerRepository){
        this.customerRepository=customerRepository;
    }

    @Override
    public Flux<GetAllCustomerUseCaseResponse> execute(GetSupplierUCRequest request, UseCaseContext context) {
        return customerRepository.findByMemberIdAndSupplierOrderByCreatedAtDesc(context.securityContext().memberId(),true)
                .map(CustomerConvertor::toResponse)
                .onErrorResume(err->Flux.error(new Throwable("Failed to load supplier: " +err.getLocalizedMessage())));
    }
}
