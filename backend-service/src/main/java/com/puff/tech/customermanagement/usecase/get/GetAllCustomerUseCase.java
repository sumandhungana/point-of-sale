package com.puff.tech.customermanagement.usecase.get;

import com.puff.tech.core.usecases.FluxUC;
import com.puff.tech.customermanagement.converter.CustomerConvertor;
import com.puff.tech.customermanagement.repository.CustomerRepository;
import com.puff.tech.security.UseCaseContext;
import com.puff.tech.security.UserSecurityContext;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Flux;

@Singleton
public class GetAllCustomerUseCase implements FluxUC<GetCustomerUseCaseRequest, GetAllCustomerUseCaseResponse> {

    private final CustomerRepository customerRepository;


    @Inject
    public GetAllCustomerUseCase(CustomerRepository customerRepository){
        this.customerRepository=customerRepository;

    }


    @Override
    public Flux<GetAllCustomerUseCaseResponse> execute(GetCustomerUseCaseRequest request, UseCaseContext context) {
        return customerRepository.findByMemberIdAndSupplierOrderByCreatedAtDesc(context.securityContext().memberId(), false)
                .map(CustomerConvertor::toResponse)
                .onErrorResume(err-> Flux.error(new Throwable(err.getLocalizedMessage())));
    }
}
