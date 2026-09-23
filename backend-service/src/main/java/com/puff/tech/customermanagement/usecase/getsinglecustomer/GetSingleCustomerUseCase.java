package com.puff.tech.customermanagement.usecase.getsinglecustomer;

import com.puff.tech.core.usecases.MonoUC;
import com.puff.tech.customermanagement.converter.CustomerConvertor;
import com.puff.tech.customermanagement.repository.CustomerRepository;
import com.puff.tech.customermanagement.usecase.get.GetAllCustomerUseCaseResponse;
import com.puff.tech.security.UseCaseContext;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class GetSingleCustomerUseCase implements MonoUC<GetSingleCustomerUCRequest, GetAllCustomerUseCaseResponse> {

    private final CustomerRepository customerRepository;

    @Inject
    public GetSingleCustomerUseCase(CustomerRepository customerRepository){
        this.customerRepository= customerRepository;
    }
    @Override
    public Mono<GetAllCustomerUseCaseResponse> execute(GetSingleCustomerUCRequest request, UseCaseContext context) {
        return customerRepository.findByIdAndMemberId(request.customerId(), context.securityContext().memberId())
                .map(CustomerConvertor::toResponse)
                .onErrorResume(err->Mono.error(new Throwable("Unexpected happened: " +err.getLocalizedMessage())));
    }
}
